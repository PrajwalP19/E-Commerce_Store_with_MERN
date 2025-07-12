import express from "express"
import { addToCart, getCartProducts, removeAllFromCart, updateQuantity } from "../controllers/cart.controller.js"
import { protectRoutes } from "../middlewares/auth.middleware.js"

const router = express.Router()


router.get("/", protectRoutes, getCartProducts)
router.post("/", protectRoutes, addToCart)
router.delete("/", protectRoutes, removeAllFromCart)
router.put("/:id", protectRoutes, updateQuantity)


export default router