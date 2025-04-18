import express from "express";
import Board from "../models/board.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Get boards for logged-in user (both owned and as team member)
router.get("/", verifyToken, async (req, res) => {
    try {
        // find boards where user is either the owner OR a team member
        const boards = await Board.find({
            $or: [
                { ownerId: req.userId },
                { teamMembers: req.userId }
            ]
        });

        res.json(boards);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
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
            teamMembers: [req.userId],
            backgroundColor: backgroundColor,
        });

        await newBoard.save();

        // Emit socket event to all clients
        req.app.locals.io.emit("boardCreated", newBoard);

        res.status(201).json(newBoard);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

export default router;

// Delete a board
router.delete("/:boardId", verifyToken, async (req, res) => {
    try {
        const board = await Board.findById(req.params.boardId);

        if (!board) {
            return res.status(404).json({ message: "Board not found" });
        }

        // Check if the user is the owner of the board
        if (board.ownerId.toString() !== req.userId) {
            return res.status(403).json({ message: "You don't have permission to delete this board" });
        }

        await Board.findByIdAndDelete(req.params.boardId);

        // Emit socket event to all clients
        req.app.locals.io.emit("boardDeleted", req.params.boardId);
        console.log("Board deleted, emitting to sockets:", req.params.boardId);


        res.json({ message: "Board deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
