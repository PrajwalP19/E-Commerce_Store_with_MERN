import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import productRoutes from "./routes/product.route.js"
import cartRoutes from "./routes/cart.route.js"
import couponRoutes from "./routes/coupon.route.js"
import paymentRoutes from "./routes/payment.route.js"
import analyticsRoutes from "./routes/analytics.route.js"
import { connectDB } from "./lib/db.js"
import cookieParser from "cookie-parser"
import cors from "cors"




dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000


app.use(cors({
  origin: "http://localhost:5173",  
  credentials: true               
}));

app.use(express.json({limit: "10mb"}))   //allows to parse the body of req
app.use(cookieParser())   



app.use("/api/v1/auth", authRoutes)

app.use("/api/v1/products", productRoutes)

app.use("/api/v1/cart", cartRoutes)

app.use("/api/v1/coupons", couponRoutes)

app.use("/api/v1/payments", paymentRoutes)

app.use("/api/v1/analytics", analyticsRoutes)



app.listen(5000, () => {
    console.log(`server is listening on http://localhost:${PORT}`)

    connectDB()
})

