import express from "express";
import { createPaymentIntent, confirmPayment } from "./stripe.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/payments/create-intent", createPaymentIntent);
router.post("/payments/confirm", confirmPayment);

export default router;