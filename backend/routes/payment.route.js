import express from "express";
import { protectRoutes } from "../middlewares/auth.middleware.js"
import { checkoutSuccess, createCheckoutSession } from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/create-checkout-session", protectRoutes, createCheckoutSession);

router.post("/checkout-success", protectRoutes, checkoutSuccess);

export default router;