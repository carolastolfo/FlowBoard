import mongoose from "mongoose";

const taskSchema = mongoose.Schema({
  tasks: {
    type: Map,
    of: {
      title: { type: String, required: true },
      items: [
        {
          id: { type: String, required: true },
          content: { type: String, required: true },
          status: { type: String, enum: ["To Do", "Doing", "Done"], required: true },
          due_date: { type: Date, required: false },
          completed: { type: Boolean, default: false },
        },
      ],
    },
    default: {
      "col-1": { title: "To Do", items: [] },
      "col-2": { title: "Doing", items: [] },
      "col-3": { title: "Done", items: [] },
    },
  },
});

const Task = mongoose.model("tasks", taskSchema);

export default Task;
