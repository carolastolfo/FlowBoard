import express from "express";
import { data } from "./data.js";

const router = express.Router();

// Search boards by ID 
router.get("/board/:boardId", (req, res) => {
    const boardId = parseInt(req.params.boardId)
    const board = data.boards.find(b => b.id === boardId)

    if (!board) {
        return res.status(404).json({ message: "Board not found" })
    }
    console.log('search a board')
    res.json(board)
});

// Request to join team board by ID  
router.post("/boards/:boardId/join", (req, res) => {
    // ? make it undefined instead of rasing an error
    const userId = req.user?.id; // Get user id from authentication. Test available after authentication part completed
    const boardId = parseInt(req.params.boardId)

    if (!userId) {
        return res.status(401).json({ message: "User not found"});
    }

    const board = data.boards.find(b => b.id === boardId)
    if (!board) {
        return res.status(404).json({ message: "Board not found" })
    }

    // Check if the user is already a member
    if (board.team_members.includes(userId)) {
        return res.status(400).json({ message: "User is already a member" })
    }

    // Create a join request
    const newRequest = {
        id: data.join_requests.length + 1,
        user_id: userId,
        board_id: boardId,
        status: "pending",
    }

    data.join_requests.push(newRequest)
    res.status(201).json({ message: "Join request sent", request: newRequest })
});

// Accept request from new team member  
router.put("/join-requests/:requestId/accept", (req, res) => {
    const requestId = parseInt(req.params.requestId)
    const request = data.join_requests.find(r => r.id === requestId)

    if (!request) {
        return res.status(404).json({ message: "Join request not found" })
    }

    const board = data.boards.find(b => b.id === request.board_id)

    // Check if the requester (authenticated user) is the board owner
    if (req.user?.id !== board.owner_id) { // Test available after authentication part completed
        return res.status(403).json({ message: "Only the board owner can accept requests" })
    }

    // Find the user making the join request
    const user = data.users.find(u => u.id === request.user_id)
    
    // Add board ID to the user's boards
    if (!user.boards.includes(board.id)) {
        user.boards.push(board.id)
    }

    // Update the board and request status
    board.team_members = board.team_members.length + 1
    request.status = "accepted"

    res.json({ message: "User added to the board", board })
});


export default router;