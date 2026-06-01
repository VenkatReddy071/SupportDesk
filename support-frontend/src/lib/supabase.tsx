import { createClient } from '@supabase/supabase-js';
 
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
 
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type AlertStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export type AlertType = 'aml' | 'fraud' | 'kyc' | 'credit' | 'compliance' | 'suspicious_activity';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'flagged' | 'blocked';

export type AccountStatus = 'active' | 'frozen' | 'closed' | 'suspended';
 
export interface Customer {

  id: string;

  name: string;

  email: string;

  phone: string;

  country: string;

  account_type: 'personal' | 'business' | 'premium';

  credit_score: number;

  risk_level: RiskLevel;

  kyc_status: 'pending' | 'verified' | 'failed' | 'expired';

  total_assets: number;

  is_pep: boolean;

  is_sanctioned: boolean;

  created_at: string;

  updated_at: string;

}
 
export interface Account {

  id: string;

  customer_id: string;

  account_number: string;

  account_type: 'checking' | 'savings' | 'investment' | 'credit';

  balance: number;

  currency: string;

  status: AccountStatus;

  opened_at: string;

}
 
export interface Transaction {

  id: string;

  account_id: string | null;

  customer_id: string;

  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment' | 'wire' | 'crypto';

  amount: number;

  currency: string;

  description: string;

  counterparty: string;

  status: TransactionStatus;

  risk_score: number;

  flagged: boolean;

  flag_reason: string;

  ip_address: string;

  device_id: string;

  created_at: string;

  customers?: { name: string };

}
 
export interface RiskAlert {

  id: string;

  customer_id: string | null;

  transaction_id: string | null;

  alert_type: AlertType;

  severity: RiskLevel;

  title: string;

  description: string;

  status: AlertStatus;

  assigned_to: string;

  created_at: string;

  resolved_at: string | null;

  customers?: { name: string };

}
 
export interface RiskRule {

  id: string;

  name: string;

  description: string;

  rule_type: 'transaction_amount' | 'frequency' | 'geography' | 'behavioral' | 'kyc' | 'aml';

  threshold: number;

  enabled: boolean;

  triggered_count: number;

  created_at: string;

}

 