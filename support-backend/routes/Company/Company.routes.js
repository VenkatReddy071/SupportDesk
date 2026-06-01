import express from "express";

import { companysCount, createCompany } from "../../controller/company/company.js";

const companyRouter=express.Router();

companyRouter.post("/create",createCompany);
companyRouter.get("/count",companysCount);


export default companyRouter;