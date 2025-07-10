import { setCookies } from "../lib/cookies.js";
import { redis } from "../lib/redis.js";
import generateTokens from "../lib/token.js";
import { User } from "../models/user.model.js";
import jwt from "jsonwebtoken"


// Store refresh token in Redis with TTL = 7 days
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60);
};


export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists!" });
    }

    // Create user (password is hashed in pre-save hook)
    const newUser = await User.create({ name, email, password });

    // Generate access and refresh tokens
    const { accessToken, refreshToken } = generateTokens(newUser._id);

    // Store refresh token in Redis
    await storeRefreshToken(newUser._id, refreshToken);

    // Set cookies
    setCookies(res, refreshToken, accessToken);

    // Fetch user without password
    const user = await User.findById(newUser._id).select("-password");

    // Send response
    res.status(201).json({
        user: formatUser(user),
        message: "User created successfully."});
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: error.message });
  }
};



export const login = async (req, res) => {
    try {
      const { email, password } = req.body
      const user = await User.findOne({email})

      if (user && (await user.comparePassword(password))) {
        const { accessToken, refreshToken } = generateTokens(user._id)

        await storeRefreshToken(user._id, refreshToken)
        setCookies(res, accessToken, refreshToken)

        res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        })
      }  else {
      res.status(401).json({ message: "Invalid email or password" });
    }

    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message: error.message})
    }
}


export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        await redis.del(`refresh_token:${decoded.userId}`);
      } catch (err) {
        console.log("Invalid refresh token during logout:", err.message);
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });

  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "server error", error: error.message });
  }
};

//this will refresh the access token

export const refreshToken = async (req, res) => {
    try {
      console.log("REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);

      const refreshToken = req.cookies.refreshToken
      
      if (!refreshToken) {
        return res.status(401).json({message: "No refresh token provided"})
      }

      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

      const storedToken = await redis.get(`refresh_token:${decoded.userId}`)

      if (storedToken !== refreshToken) {
        return res.status(401).json({message: "Invalid refresh token"})
      }

      const accessToken = jwt.sign({userId: decoded.userId}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: "20m"})

      res.cookie("accessToken", accessToken, {
        httpOnly: true,  //prevents XSS attacks
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",  //prevents CSRF attacks
        maxAge: 20*60*1000   //20 minutes
    })

    console.log("Received refresh token:", refreshToken);
console.log("Current REFRESH_TOKEN_SECRET:", process.env.REFRESH_TOKEN_SECRET);


    res.json({message: "Token refreshed successfully"})

   } catch (error) {
  console.error("Error verifying refresh token:", error);
  res.status(401).json({ message: "Invalid or expired refresh token", error: error.message });
}

}


export const getProfile = async (req, res) => {

}



      
//helper function for formatted user - 

const formatUser = (user) => ({ 
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});


