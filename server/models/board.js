import mongoose from "mongoose";

const userSchema = new mongoose.Schema(

);

const Board = mongoose.model("boards", userSchema);
export default Board;