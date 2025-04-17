import mongoose from "mongoose";

const joinRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "boards",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "rejected"],
    default: "pending",
    required: true,
  },
}, { timestamps: true });

const JoinRequest = mongoose.model("joinRequests", joinRequestSchema);
export default JoinRequest;
