import express from "express"
import { adminRoute, protectRoutes } from "../middlewares/auth.middleware.js"
import { createProduct, deleteProduct, getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts, toggleFeaturedProduct } from "../controllers/product.controller.js"


const router = express.Router()


router.get("/", protectRoutes, adminRoute, getAllProducts)

router.get("/featured", getFeaturedProducts)

router.get("/category/:category", getProductsByCategory)

router.get("/recommendation", getRecommendedProducts)

router.post("/", protectRoutes, adminRoute, createProduct)

router.patch("/:id", protectRoutes, adminRoute, toggleFeaturedProduct)

router.delete("/:id", protectRoutes, adminRoute, deleteProduct)


export default router