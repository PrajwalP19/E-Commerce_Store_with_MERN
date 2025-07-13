import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required!!"]
    },
    email: {
        type: String,
        required: [true, "email is required!!"],
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: [true, "password is required!!"],
        minLength: [6, "password must be of 6 characters long!!"],
    },
    cartItems: [
        {
            quantity: {
                type: Number,
                default: 1
            },
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        }
    ],
    role: {
        type: String,
        enum: ["customer", "admin"],
        default: "customer"
    }
}, {timestamps: true}
) 




//hashing password

//pre-save hook to hash password before saving to the database

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next()
        
        try {
            const salt = await bcrypt.genSalt(10)
            this.password = await bcrypt.hash(this.password, salt)
            next()     
        } catch (error) {
            next(error)
        }      
    })
    
    //to compare the password entered by user with the one saved in db.
    
    userSchema.methods.comparePassword = async function (password) {
        return bcrypt.compare(password, this.password)
    }
    
    
    
    export const User = mongoose.model("User", userSchema)