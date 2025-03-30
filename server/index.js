import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv"
import fetch_router from "./routers/fetch_router.js";
import user_router from "./routers/user_router.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// routes
app.use("/fetch", fetch_router);
app.use("/user", user_router)

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

// app.listen(PORT, () => {
//   console.log(`http://localhost:${PORT}`);
// });

app.use((req, res) => {
  res.send(`No request for ${req.url} exists`);
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () =>
      console.log(`Server running on http://localhost:${PORT}`)
    );
  })
  .catch((error) => console.error("MongoDB connection error:", error));