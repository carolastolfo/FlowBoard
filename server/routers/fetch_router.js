import express from "express";
import { data } from "./data.js";
import { tasks } from "./data.js";
import User from "../models/user.js";
import Board from "../models/board.js";

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

// Search boards by Name
router.get("/board/:boardName", async (req, res) => {
    console.log('search a board')
    const boardName = req.params.boardName;
    const board = await Board.findOne({ name: { $regex: boardName, $options: "i" } }); // case insensitive

    if (!board) {
        return res.status(404).json({ message: "Board not found" })
    }
    res.json(board)
});

// Request to join team board -> client side join button
router.post("/boards/:boardId/join", (req, res) => {
    // ? makes it undefined instead of rasing an error
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
    Task.find().then((tasks) => {
        res.json(tasks);
    });
});

// Route to Add a Task
router.post("/addtask", (req, res) => {
    const { columnId, content } = req.body;

    if (!content.trim()) {
        return res.status(400).json({ message: "Task content cannot be empty" });
    }

    Task.findOne()
        .then((taskDocument) => {
            if (!taskDocument) {
                return res.status(404).json({ message: "No tasks found in the database" });
            }

            if (!taskDocument.tasks.has(columnId)) {
                return res.status(404).json({ message: "Column not found" });
            }

            let taskStatus = "To Do";
            if (columnId === "col-2") {
                taskStatus = "Doing";
            } else if (columnId === "col-3") {
                taskStatus = "Done";
            }

            const newTask = {
                id: Date.now().toString(),
                content,
                status: taskStatus,
                due_date: null,
            };

            taskDocument.tasks.get(columnId).items.push(newTask);

            taskDocument.save()
                .then(() => {
                    console.log("Task added:", newTask);

                    res.status(201).json({
                        message: "Task added successfully",
                        task: newTask,
                        tasks: taskDocument.tasks,
                    });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: "Server error", error: error.message });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Server error", error: error.message });
        });
});

// Route to Delete a Task
router.delete("/deletetask/:columnId/:taskId", (req, res) => {
    const { columnId, taskId } = req.params;

    Task.findOne()
        .then((taskDocument) => {
            if (!taskDocument) {
                return res.status(404).json({ message: "No tasks found in the database" });
            }

            if (!taskDocument.tasks.has(columnId)) {
                return res.status(404).json({ message: "Column not found" });
            }

            const column = taskDocument.tasks.get(columnId);
            const taskIndex = column.items.findIndex(task => task.id === taskId);

            if (taskIndex === -1) {
                return res.status(404).json({ message: "Task not found" });
            }

            column.items.splice(taskIndex, 1);

            taskDocument.save()
                .then(() => {
                    console.log(`Task ${taskId} deleted from column ${columnId}`);
                    res.json({ message: "Task deleted successfully", tasks: taskDocument.tasks });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: "Server error", error: error.message });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Server error", error: error.message });
        });
});

// Route to edit a Task
router.put("/edittask", async (req, res) => {
    const { columnId, taskId, content, completed, status } = req.body;

    // Check for missing parameters
    if (!columnId || !taskId || !content || status === undefined) {
        return res.status(400).json({ message: "Missing columnId, taskId, content, or completed status" });
    }

    try {
        // Find the task document in the database
        const taskDocument = await Task.findOne();

        if (!taskDocument || !taskDocument.tasks.has(columnId)) {
            return res.status(404).json({ message: "Column not found" });
        }

        const column = taskDocument.tasks.get(columnId);

        // Find the task in the column's items
        let taskFound = false;
        column.items = column.items.map((task) => {
            if (task.id === taskId) {
                taskFound = true;
                // Update the task properties
                task.content = content;
                task.completed = completed;
                task.status = status;
            }
            return task;
        });

        if (!taskFound) {
            return res.status(404).json({ message: "Task not found" });
        }

        // Save the updated task document back to the database
        await taskDocument.save();

        console.log(`Task ${taskId} in column ${columnId} updated to "${content}" with completed: ${completed}`);

        res.json({ message: "Task updated successfully", tasks: taskDocument.tasks });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Route to add a new column
router.post("/addcolumn", (req, res) => {
    const { columnName } = req.body;

    if (!columnName || columnName.trim() === "") {
        return res.status(400).json({ message: "Column name is required" });
    }

    // Find the task document
    Task.findOne()
        .then((task) => {
            // If no task document exists, create one
            if (!task) {
                task = new Task();
            }

            // Generate new column ID
            const existingColumnIds = Array.from(task.tasks.keys())
                .map(id => parseInt(id.replace("col-", ""), 10))
                .filter(num => !isNaN(num));

            const maxId = existingColumnIds.length > 0 ? Math.max(...existingColumnIds) : 0;
            const newColumnId = `col-${maxId + 1}`;

            // Add new column
            task.tasks.set(newColumnId, { title: columnName, items: [] });

            // Save the updated task document
            task.save()
                .then(() => {
                    console.log(`New column added: ${columnName} (ID: ${newColumnId})`);
                    res.status(201).json({ message: "Column added", tasks: task.tasks });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: "Error saving updated task", error: error.message });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error retrieving tasks from the database", error: error.message });
        });
});

// Route to delete a column
router.delete("/deletecolumn/:columnId", (req, res) => {
    const { columnId } = req.params;

    console.log("Received delete column request:", columnId);

    // Find the task document
    Task.findOne()
        .then((task) => {
            if (!task) {
                return res.status(404).json({ message: "Tasks not found in the database" });
            }

            // Check if the column exists
            if (!task.tasks.has(columnId)) {
                return res.status(400).json({ message: "Invalid column ID" });
            }

            // Remove the column from the Map
            task.tasks.delete(columnId);

            // Save the updated task document
            task.save()
                .then(() => {
                    console.log(`Column ${columnId} deleted successfully`);
                    res.json({ message: "Column deleted", tasks: task.tasks });
                })
                .catch((error) => {
                    console.error(error);
                    res.status(500).json({ message: "Error saving updated task", error: error.message });
                });
        })
        .catch((error) => {
            console.error(error);
            res.status(500).json({ message: "Error retrieving tasks from the database", error: error.message });
        });
});

export default router;