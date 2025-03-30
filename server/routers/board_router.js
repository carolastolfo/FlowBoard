import express from "express";
import Board from "../models/board.js";
import { verifyToken } from "../middleware/auth.js"; 

const router = express.Router();

// Get boards for logged-in user
router.get("/", verifyToken, async (req, res) => {
    try {
        const boards = await Board.find({ ownerId: req.userId });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
});

// Create a board
router.post("/", verifyToken, async (req, res) => {
    try {
        const { name, backgroundColor } = req.body;
        const newBoard = new Board({
            name,
            ownerId: req.userId,
            tasks: [],
            teamMembers: [],
            backgroundColor: backgroundColor,
        });

        await newBoard.save();
        res.status(201).json(newBoard);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;
