import express from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { createUserBill, getUserBills, updateUserBill, deleteUserBill } from "./bills.controller.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";
import { createUserBillSchema, updateUserBillSchema } from "./bills.validator.js";


const router = express.Router();

router.use(authMiddleware);
router.get("/", getUserBills);
router.post("/", validateRequest(createUserBillSchema), createUserBill);
router.patch("/:id", validateRequest(updateUserBillSchema), updateUserBill);
router.delete("/:id", deleteUserBill);

export default router;