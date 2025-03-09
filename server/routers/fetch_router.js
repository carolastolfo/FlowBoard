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
        return res.status(401).json({ message: "User not found" });
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

// login
router.post("/login", (req, res) => {
    const { username, password } = req.body;

    console.log("Received:", { username, password });

    // Find user in the dummy data
    const user = data.users.find(u => u.username === username && u.password === password);

    if (user) {
        // If match is found, send success message in JSON format
        res.json({ message: "Login successful!" });
    } else {
        // If no match is found, send error message in JSON format
        res.status(401).json({ message: "Invalid username or password" });
    }
})

// registration

router.post("/register", (req, res) => {
    const { username, email, password } = req.body;

    console.log(`Received user: ${username}, ${email}, ${password}`)

    // Check if the username or email already exists
    const existingUser = data.users.find(
        (user) => user.username === username || user.email === email
    );
    if (existingUser) {
        return res.status(400).json({ message: "Username or email already exists." });
    }

    // Create new user object and add it to the "database"
    const newUser = {
        id: data.users.length + 1,
        username,
        email,
        password, // Save plain text password - hash it later?
        role: "user", // Default role
    };
    data.users.push(newUser); // Add the new user

    // Send success response
    res.status(201).json({ message: "User registered successfully" });
});

// Initial Task Data
const tasks = {
    "col-1": { title: 'To Do', items: [{ id: '1', content: 'Design UI' }] },
    "col-2": { title: 'Doing', items: [{ id: '1', content: 'Develop API' }] },
    "col-3": { title: 'Done', items: [{ id: '1', content: 'Write Docs' }] },
};

// Route to Fetch Tasks
router.get("/task", (req, res) => {
    // console.log("Sending tasks:", tasks);
    console.log("Sending tasks:", JSON.stringify(tasks))
    res.json(tasks);
});

// Route to Add a Task
router.post("/addtask", (req, res) => {
    const { columnId, content } = req.body;

    if (!tasks[columnId]) {
        return res.status(400).json({ message: "Invalid column ID" });
    }

    const existingTasks = tasks[columnId].items;
    const maxId = existingTasks.length > 0
        ? Math.max(...existingTasks.map(task => parseInt(task.id)))
        : 0;

    const newTask = { id: (maxId + 1).toString(), content };

    tasks[columnId].items.push(newTask);

    console.log("Updated tasks:", JSON.stringify(tasks));
    res.json({ message: "Task added", tasks });
});

// Route to Delete a Task
router.delete("/deletetask/:columnId/:taskId", (req, res) => {
    const { columnId, taskId } = req.params;

    console.log("Received delete request:", columnId, taskId);

    if (!columnId || !taskId || !tasks[columnId]) {
        return res.status(400).json({ message: "Invalid column ID or Task ID" });
    }

    console.log("Before deletion:", JSON.stringify(tasks[columnId].items, null, 2));

    tasks[columnId].items = tasks[columnId].items.filter(task => task.id !== taskId);

    console.log("After deletion:", JSON.stringify(tasks[columnId].items, null, 2));

    res.json({ message: "Task deleted", tasks });
});

// Route to edit a Task
router.put("/edittask", (req, res) => {
    const { columnId, taskId, content } = req.body;

    console.log("Received edit request:", { columnId, taskId, content });

    if (!columnId || !taskId || !content) {
        return res.status(400).json({ message: "Missing columnId, taskId, or content" });
    }

    if (!tasks[columnId]) {
        return res.status(404).json({ message: "Column not found" });
    }

    let taskFound = false;
    tasks[columnId].items = tasks[columnId].items.map((task) => {
        if (task.id === taskId) {
            taskFound = true;
            return { ...task, content };
        }
        return task;
    });

    if (!taskFound) {
        return res.status(404).json({ message: "Task not found" });
    }

    console.log("Updated tasks:", JSON.stringify(tasks));

    res.json({ message: "Task updated", tasks });
});

// Route to add a new column
router.post("/addcolumn", (req, res) => {
    const { columnName } = req.body;

    if (!columnName || columnName.trim() === "") {
        return res.status(400).json({ message: "Column name is required" });
    }

    const existingColumnIds = Object.keys(tasks)
        .map(id => parseInt(id.replace("col-", ""), 10))
        .filter(num => !isNaN(num));

    const maxId = existingColumnIds.length > 0 ? Math.max(...existingColumnIds) : 0;
    const newColumnId = `col-${(maxId + 1).toString()}`;

    tasks[newColumnId] = { title: columnName, items: [] };

    console.log("Updated tasks after adding a new column:", JSON.stringify(tasks));

    res.status(201).json({ message: "Column added", tasks });
});

// Route to delete a column


export default router;

