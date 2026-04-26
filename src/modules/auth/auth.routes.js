import express from "express";
import { create, login, logout } from "./auth.controller.js";
import { createUserSchema, loginSchema } from "./auth.validator.js";
import { validateRequest } from "../../middlewares/validate-request.middleware.js";

const router = express.Router();

router.post("/logout", logout);
router.post("/login", validateRequest(loginSchema), login);
router.post("/create", validateRequest(createUserSchema), create);

export default router;