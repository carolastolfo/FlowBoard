import express from "express";
import { data } from "./data.js";
import { tasks } from "./data.js";

const router = express.Router();

// Route to Move a task
router.put("/updateTaskColumn/:taskId", (req, res) => {
    const taskId = req.params.taskId;
    const { fromColumnId, toColumnId } = req.body;

    if (!fromColumnId || !toColumnId) {
        return res.status(400).json({ message: "Missing fromColumnId or toColumnId" });
    }

    if (!tasks[fromColumnId] || !tasks[toColumnId]) {
        return res.status(404).json({ message: "One of the columns was not found" });
    }

    // Find the task in the old column
    const taskIndex = tasks[fromColumnId].items.findIndex(task => task.id === taskId);
    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found in the original column" });
    }

    // Remove the task from the old column
    const [movedTask] = tasks[fromColumnId].items.splice(taskIndex, 1);

    // Add the task to the new column
    tasks[toColumnId].items.push(movedTask);

    console.log(`Task "${movedTask.content}" moved from ${fromColumnId} to ${toColumnId}`);

    res.json({ message: "Task moved successfully", tasks });
});

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

// Route to Fetch Tasks
router.get("/task", (req, res) => {
    // console.log("Sending tasks:", tasks);
    console.log("Sending tasks:", JSON.stringify(tasks))
    res.json(tasks);
});

// Route to Add a Task
router.post("/addtask", (req, res) => {
    const { columnId, content } = req.body;

    if (!content.trim()) {
        return res.status(400).json({ message: "Task content cannot be empty" });
    }

    if (!tasks[columnId]) {
        return res.status(404).json({ message: "Column not found" });
    }

    const newTask = {
        id: Date.now().toString(),
        content,
        columnId,
        completed: false
    };

    tasks[columnId].items.push(newTask);

    console.log("Task added:", newTask);

    res.status(201).json({ message: "Task added successfully", task: newTask, tasks });
});

// Route to Delete a Task
router.delete("/deletetask/:columnId/:taskId", (req, res) => {
    const { columnId, taskId } = req.params;

    if (!tasks[columnId]) {
        return res.status(404).json({ message: "Column not found" });
    }

    const taskIndex = tasks[columnId].items.findIndex(task => task.id === taskId);

    if (taskIndex === -1) {
        return res.status(404).json({ message: "Task not found" });
    }

    // Remove the task
    tasks[columnId].items.splice(taskIndex, 1);

    console.log(`Task ${taskId} deleted from column ${columnId}`);

    res.json({ message: "Task deleted successfully", tasks });
});

// Route to edit a Task
router.put("/edittask", (req, res) => {
    const { columnId, taskId, content, completed, status } = req.body;

    if (!columnId || !taskId || !content || status === undefined || completed === undefined) {
        return res.status(400).json({ message: "Missing columnId, taskId, content, or completed status" });
    }

    if (!tasks[columnId]) {
        return res.status(404).json({ message: "Column not found" });
    }

    let taskFound = false;
    tasks[columnId].items = tasks[columnId].items.map((task) => {
        if (task.id === taskId) {
            taskFound = true;
            return { ...task, content, completed, status };
        }
        return task;
    });

    if (!taskFound) {
        return res.status(404).json({ message: "Task not found" });
    }

    console.log(`Task ${taskId} in column ${columnId} updated to "${content}" with completed: ${completed}`);

    res.json({ message: "Task updated successfully", tasks });
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

    console.log(`New column added: ${columnName} (ID: ${newColumnId})`);

    res.status(201).json({ message: "Column added", tasks });
});

// Route to delete a column
router.delete("/deletecolumn/:columnId", (req, res) => {
    const { columnId } = req.params;

    console.log("Received delete column request:", columnId);

    if (!tasks[columnId]) {
        return res.status(400).json({ message: "Invalid column ID" });
    }

    delete tasks[columnId];

    console.log(`Column ${columnId} deleted successfully`);

    res.json({ message: "Column deleted", tasks });
});

export default router;