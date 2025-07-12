import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"





dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000

app.use(express.json())   //allows to parse the body of req
app.use(cookieParser())   


app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/products", productRoutes)
app.use("/api/v1/cart", cartRoutes)
app.use("/api/v1/coupons", couponRoutes)

app.listen(5000, () => {
    console.log(`server is listening on http://localhost:${PORT}`)

    connectDB()
})

