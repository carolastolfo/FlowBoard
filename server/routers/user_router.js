import express from "express";
import User from "../models/user.js"; 
import bcrypt from "bcryptjs";
import auth from "../middleware/auth.js";


const router = express.Router();


// Login route
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`trying to login user ${email}`)
        
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(401).json({ message: "Invalid email" });
        }
        
        // Compare the provided password with the stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }
        
        // Generate JWT token
        const token = auth.generateToken(user._id);
        
        res.json({ 
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                boards: [],
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Logout route
router.post("/logout", async (req, res) => {
    try {
      // the server doesn't need to do anything
      // as the client side will remove the token from localStorage
      res.status(200).json({ message: "Logout successful" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Registration route
router.post("/register", async (req, res) => {
    console.log("trying to register new user")
    try {
        const { username, email, password, } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role: "user", // Use provided role or default to "user"
            boards: [],
        });
        
        // Save the user to the database
        await newUser.save();

        // Generate JWT token
        const token = auth.generateToken(newUser._id);

        res.status(201).json({ 
            message: "User registered successfully",
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                boards: newUser.boards,
            }
        });
        console.log("User registered")
    } catch (error) {
        console.error("Registration error:", error);
        
        // Check for validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: messages.join(', ') });
        }
        
        res.status(500).json({ message: "Server error" });
    }
});

export default router;