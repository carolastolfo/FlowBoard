import mongoose from "mongoose";

const taskItemSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    status: { type: String, required: true },
    due_date: { type: Date },
    completed: { type: Boolean, default: false },
  },
);

const columnSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    items: { type: [taskItemSchema], default: [] },
  },
);

const defaultColumns = {
  "col-1": { title: "To Do", items: [] },
  "col-2": { title: "Doing", items: [] },
  "col-3": { title: "Done", items: [] },
};

const taskSchema = new mongoose.Schema({
  tasks: {
    type: Map,
    of: columnSchema,
    default: defaultColumns,
  },
});

const Task = mongoose.model("task", taskSchema);

export default Task;
