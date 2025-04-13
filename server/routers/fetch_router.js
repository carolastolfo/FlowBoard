import express from "express";
import { data } from "./data.js";
// import { tasks } from "./data.js";
import User from "../models/user.js";
import Board from "../models/board.js";
import Task from "../models/task.js";

const router = express.Router();

// Route to Move a task
router.put("/updateTaskColumn/:taskId", async (req, res) => {
    const taskId = req.params.taskId;
    const { fromColumnId, toColumnId } = req.body;

    if (!fromColumnId || !toColumnId) {
        return res.status(400).json({ message: "Missing fromColumnId or toColumnId" });
    }

    try {
        // Find the task document by taskId
        const taskDocument = await Task.findOne();

        // Check if the columns exist
        if (!taskDocument.tasks.has(fromColumnId) || !taskDocument.tasks.has(toColumnId)) {
            return res.status(404).json({ message: "One of the columns was not found" });
        }

        // Find the task in the old column
        const taskIndex = taskDocument.tasks.get(fromColumnId).items.findIndex(
            (task) => task._id.toString() === taskId
        );
        if (taskIndex === -1) {
            return res.status(404).json({ message: "Task not found in the original column" });
        }

        // Remove the task from the old column
        const [movedTask] = taskDocument.tasks.get(fromColumnId).items.splice(taskIndex, 1);

        // Add the task to the new column
        taskDocument.tasks.get(toColumnId).items.push(movedTask);

        // Save the document after making the changes
        await taskDocument.save();

        console.log(`Task "${movedTask.content}" moved from ${fromColumnId} to ${toColumnId}`);

        // Respond with success
        res.json({ message: "Task moved successfully", tasks: taskDocument.tasks });
    } catch (error) {
        console.error("Error updating task column:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
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

// Route to Fetch all tasks
router.get("/task", (req, res) => {
    Task.find().then((tasks) => {
        res.json(tasks);
    })
});

// Route to Add a Task
router.post("/addtask", (req, res) => {
    const { columnId, content } = req.body;

    if (!content || !content.trim()) {
        return res.status(400).json({ message: "Task content cannot be empty" });
    }

    Task.findOne()
        .then(taskDocument => {
            if (!taskDocument) {
                taskDocument = new Task();
            }

            if (!taskDocument.tasks.has(columnId)) {
                return res.status(404).json({ message: "Column not found" });
            }

            // let taskStatus = "To Do";
            // if (columnId === "col-2") taskStatus = "Doing";
            // else if (columnId === "col-3") taskStatus = "Done";

            const columnTitle = taskDocument.tasks.get(columnId).title;

            const newTask = {
                content,
                status: columnTitle,
                due_date: null,
                completed: false,
            };

            taskDocument.tasks.get(columnId).items.push(newTask);

            return taskDocument.save().then(savedDoc => {
                console.log("Task added:", newTask);
                res.status(201).json({
                    message: "Task added successfully",
                    task: newTask,
                    tasks: savedDoc.tasks,
                });
            });
        })
        .catch(error => {
            console.error("Server error:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        });
});

// Route to Delete a Task
router.delete("/deletetask/:columnId/:taskId", (req, res) => {
    const { columnId, taskId } = req.params;

    Task.findOne()
        .then(taskDocument => {
            if (!taskDocument || !taskDocument.tasks.has(columnId)) {
                return res.status(404).json({ message: "Column not found" });
            }

            const column = taskDocument.tasks.get(columnId);
            const taskIndex = column.items.findIndex(task => task._id.toString() === taskId);

            if (taskIndex === -1) {
                return res.status(404).json({ message: "Task not found" });
            }

            column.items.splice(taskIndex, 1);

            return taskDocument.save();
        })
        .then(savedDoc => {
            console.log(`Task with ID ${taskId} was successfully deleted from column ${columnId}`);
            res.json({ message: "Task deleted", tasks: savedDoc.tasks });
        })
        .catch(error => {
            console.error("Error during task deletion:", error);
            res.status(500).json({ message: "Server error", error: error.message });
        });
});

// Route to edit a Task
router.put("/edittask", (req, res) => {
    const { columnId, taskId, content, completed, status } = req.body;

    console.log('Received data:', { columnId, taskId, content, completed, status });

    if (!columnId || !taskId || !content || status === undefined) {
        return res.status(400).json({ message: "Missing columnId, taskId, content, or completed status" });
    }

    Task.findOne()
        .then((taskDocument) => {
            if (!taskDocument || !taskDocument.tasks.has(columnId)) {
                return res.status(404).json({ message: "Column not found" });
            }

            const column = taskDocument.tasks.get(columnId);
            let taskFound = false;

            column.items = column.items.map((task) => {
                if (task._id.toString() === taskId) {
                    taskFound = true;
                    task.content = content;
                    task.completed = completed;
                    task.status = status;
                }
                return task;
            });

            if (!taskFound) {
                return res.status(404).json({ message: "Task not found" });
            }

            return taskDocument.save();
        })
        .then((savedDoc) => {
            console.log(`Task ${taskId} in column ${columnId} updated`);
            res.json({ message: "Task updated successfully", tasks: savedDoc.tasks });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ message: "Internal Server Error" });
        });
});

// Route to add a new column
router.post("/addcolumn", (req, res) => {
    const { columnName } = req.body;

    if (!columnName || columnName.trim() === "") {
        return res.status(400).json({ message: "Column name is required" });
    }

    Task.findOne()
        .then((task) => {

            if (!task) {
                task = new Task();
            }

            const existingColumnIds = Array.from(task.tasks.keys())
                .map(id => parseInt(id.replace("col-", ""), 10))
                .filter(num => !isNaN(num));

            const maxId = existingColumnIds.length > 0 ? Math.max(...existingColumnIds) : 0;
            const newColumnId = `col-${maxId + 1}`;

            task.tasks.set(newColumnId, { title: columnName, items: [] });

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