import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        lowercase: true,
        trim: true,
      },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [5, "Password must be at least 5 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },
    boards: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'boards'
    }]
  },
  {
    timestamps: true
  }
);

const User = mongoose.model("users", userSchema);
export default User;