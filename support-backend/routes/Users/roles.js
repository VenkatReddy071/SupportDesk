import express from "express";
const roleRouter=express.Router();
import { createRoleController,getRoleController } from "../../controller/user/role.js";

roleRouter.post("/create",createRoleController);
roleRouter.get("/:id",getRoleController);

export default roleRouter;
