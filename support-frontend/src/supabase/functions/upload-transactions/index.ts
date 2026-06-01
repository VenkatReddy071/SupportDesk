import { createClient } from "npm:@supabase/supabase-js@2";
 
const corsHeaders = {

  "Access-Control-Allow-Origin": "*",

  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",

  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",

};
 
interface CsvRow {

  customer_email?: string;

  customer_name?: string;

  type?: string;

  amount?: string;

  currency?: string;

  description?: string;

  counterparty?: string;

  status?: string;

  risk_score?: string;

  flagged?: string;

  flag_reason?: string;

}
 
function parseCsv(text: string): CsvRow[] {

  const lines = text.trim().split("\n");

  if (lines.length < 2) return [];
 
  const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));

  const rows: CsvRow[] = [];
 
  for (let i = 1; i < lines.length; i++) {

    const values: string[] = [];

    let current = "";

    let inQuotes = false;
 
    for (const char of lines[i]) {

      if (char === '"') {

        inQuotes = !inQuotes;

      } else if (char === "," && !inQuotes) {

        values.push(current.trim());

        current = "";

      } else {

        current += char;

      }

    }

    values.push(current.trim());
 
    const row: CsvRow = {};

    headers.forEach((header, idx) => {

      if (idx < values.length) {

        (row as any)[header] = values[idx];

      }

    });

    rows.push(row);

  }

  return rows;

}
 
const VALID_TYPES = ["deposit", "withdrawal", "transfer", "payment", "wire", "crypto"];

const VALID_STATUSES = ["pending", "completed", "failed", "flagged", "blocked"];
 
Deno.serve(async (req: Request) => {

  if (req.method === "OPTIONS") {

    return new Response(null, { status: 200, headers: corsHeaders });

  }
 
  if (req.method !== "POST") {

    return new Response(JSON.stringify({ error: "Method not allowed" }), {

      status: 405,

      headers: { ...corsHeaders, "Content-Type": "application/json" },

    });

  }
 
  try {

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";

    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const supabase = createClient(supabaseUrl, supabaseKey);
 
    const formData = await req.formData();

    const file = formData.get("file") as File | null;
 
    if (!file) {

      return new Response(JSON.stringify({ error: "No file provided" }), {

        status: 400,

        headers: { ...corsHeaders, "Content-Type": "application/json" },

      });

    }
 
    const text = await file.text();

    const rows = parseCsv(text);
 
    if (rows.length === 0) {

      return new Response(JSON.stringify({ error: "CSV file is empty or has no data rows" }), {

        status: 400,

        headers: { ...corsHeaders, "Content-Type": "application/json" },

      });

    }
 
    // Collect unique customer emails to look up

    const customerEmails = [...new Set(rows.map(r => r.customer_email).filter(Boolean) as string[])];

    const { data: customers } = await supabase

      .from("customers")

      .select("id, email")

      .in("email", customerEmails);
 
    const customerMap = new Map<string, string>();

    (customers ?? []).forEach((c: { id: string; email: string }) => {

      customerMap.set(c.email.toLowerCase(), c.id);

    });
 
    // Collect customer account IDs

    const customerIds = [...customerMap.values()];

    const { data: accounts } = await supabase

      .from("accounts")

      .select("id, customer_id")

      .in("customer_id", customerIds);
 
    const accountMap = new Map<string, string>();

    (accounts ?? []).forEach((a: { id: string; customer_id: string }) => {

      if (!accountMap.has(a.customer_id)) {

        accountMap.set(a.customer_id, a.id);

      }

    });
 
    const transactions: any[] = [];

    const errors: { row: number; message: string }[] = [];

    const newCustomerRows: { email: string; name: string }[] = [];
 
    for (let i = 0; i < rows.length; i++) {

      const row = rows[i];

      const rowNum = i + 2;
 
      if (!row.type || !VALID_TYPES.includes(row.type.toLowerCase())) {

        errors.push({ row: rowNum, message: `Invalid transaction type: ${row.type}` });

        continue;

      }
 
      const amount = parseFloat(row.amount ?? "0");

      if (isNaN(amount) || amount <= 0) {

        errors.push({ row: rowNum, message: `Invalid amount: ${row.amount}` });

        continue;

      }
 
      let customerId: string | undefined;

      if (row.customer_email) {

        customerId = customerMap.get(row.customer_email.toLowerCase());

        if (!customerId && row.customer_name) {

          newCustomerRows.push({ email: row.customer_email, name: row.customer_name });

        }

      }
 
      if (!customerId) {

        errors.push({ row: rowNum, message: `Customer not found: ${row.customer_email || "no email provided"}` });

        continue;

      }
 
      const status = row.status?.toLowerCase() ?? "completed";

      const riskScore = parseInt(row.risk_score ?? "0") || 0;

      const flagged = row.flagged?.toLowerCase() === "true" || status === "flagged" || status === "blocked";
 
      transactions.push({

        customer_id: customerId,

        account_id: accountMap.get(customerId) || null,

        type: row.type.toLowerCase(),

        amount,

        currency: row.currency?.toUpperCase() || "USD",

        description: row.description || "",

        counterparty: row.counterparty || "",

        status: VALID_STATUSES.includes(status) ? status : "completed",

        risk_score: Math.min(100, Math.max(0, riskScore)),

        flagged,

        flag_reason: row.flag_reason || "",

      });

    }
 
    // Auto-create new customers that weren't found

    const uniqueNewCustomers = newCustomerRows.filter(

      (c, idx, arr) => arr.findIndex(x => x.email === c.email) === idx

    );

    for (const nc of uniqueNewCustomers) {

      const { data: newCustomer } = await supabase

        .from("customers")

        .insert({

          email: nc.email,

          name: nc.name,

          risk_level: "medium",

          kyc_status: "pending",

        })

        .select("id")

        .single();
 
      if (newCustomer) {

        customerMap.set(nc.email.toLowerCase(), newCustomer.id);
 
        const { data: newAccount } = await supabase

          .from("accounts")

          .insert({

            customer_id: newCustomer.id,

            account_number: `ACC-UPLOAD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase(),

            account_type: "checking",

            balance: 0,

            currency: "USD",

            status: "active",

          })

          .select("id")

          .single();
 
        if (newAccount) {

          accountMap.set(newCustomer.id, newAccount.id);

        }

      }

    }
 
    // Re-process rows that previously failed due to missing customer

    for (let i = 0; i < rows.length; i++) {

      const row = rows[i];

      if (!row.customer_email) continue;
 
      const customerId = customerMap.get(row.customer_email.toLowerCase());

      if (!customerId) continue;
 
      // Check if this row was already added

      const alreadyAdded = transactions.some(

        t => t.customer_id === customerId && t.amount === parseFloat(row.amount ?? "0") && t.type === row.type?.toLowerCase()

      );

      if (alreadyAdded) continue;
 
      const status = row.status?.toLowerCase() ?? "completed";

      const riskScore = parseInt(row.risk_score ?? "0") || 0;

      const flagged = row.flagged?.toLowerCase() === "true" || status === "flagged" || status === "blocked";
 
      transactions.push({

        customer_id: customerId,

        account_id: accountMap.get(customerId) || null,

        type: row.type!.toLowerCase(),

        amount: parseFloat(row.amount ?? "0"),

        currency: row.currency?.toUpperCase() || "USD",

        description: row.description || "",

        counterparty: row.counterparty || "",

        status: VALID_STATUSES.includes(status) ? status : "completed",

        risk_score: Math.min(100, Math.max(0, riskScore)),

        flagged,

        flag_reason: row.flag_reason || "",

      });

    }
 
    // Insert transactions in batches

    let inserted = 0;

    const batchSize = 50;

    for (let i = 0; i < transactions.length; i += batchSize) {

      const batch = transactions.slice(i, i + batchSize);

      const { error: insertError } = await supabase.from("transactions").insert(batch);

      if (insertError) {

        errors.push({ row: 0, message: `Batch insert error: ${insertError.message}` });

      } else {

        inserted += batch.length;

      }

    }
 
    return new Response(

      JSON.stringify({

        success: true,

        inserted,

        total_rows: rows.length,

        errors,

        new_customers: uniqueNewCustomers.length,

      }),

      {

        status: 200,

        headers: { ...corsHeaders, "Content-Type": "application/json" },

      }

    );

  } catch (err) {

    return new Response(

      JSON.stringify({ error: err.message || "Internal server error" }),

      {

        status: 500,

        headers: { ...corsHeaders, "Content-Type": "application/json" },

      }

    );

  }

});

 