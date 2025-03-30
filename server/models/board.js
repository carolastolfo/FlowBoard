import mongoose from "mongoose";

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "tasks",
    },
  ],
  teamMembers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
  ],
  backgroundColor: {
    type: String,
    default: "#FFFFFF", // default background color (white)
  },
}, { timestamps: true });

const Board = mongoose.model("boards", boardSchema);
export default Board;
