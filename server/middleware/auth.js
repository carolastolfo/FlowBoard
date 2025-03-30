import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET 

// Generate JWT Token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "1d" }); // Set token expiration time (1 day in this case)
};

// verify token
export const verifyToken = (req, res, next) => {
    const token = req.header("Authorization"); // Get token from Authorization header
    if (!token) return res.status(401).json({ message: "Access denied" });

    try {
        const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET); // Verify token
        req.userId = decoded.userId;
        next(); // Continue to the next middleware/route handler
    } catch (error) {
        res.status(400).json({ message: "Invalid token" });
    }
};

export default {generateToken, verifyToken}