import express from "express"
import dotenv from "dotenv"
import authRoutes from "./routes/auth.route.js"
import { connectDB } from "./lib/db.js"



dotenv.config()
const app = express()
const PORT = process.env.PORT || 8000

app.use("/api/v1/auth", authRoutes)

app.listen(5000, () => {
    console.log(`server is listening on http://localhost:${PORT}`)

    connectDB()
})

