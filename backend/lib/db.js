import mongoose from "mongoose";


export const connectDB = async () => {
    try {
        const connection = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`🚀✅ MongoDB Connected: ${connection.connection.host}`);
        
    } catch (error) {
        console.log("MongoDB Connection Failed: ", error.message)
        process.exit(1)
    }
}
