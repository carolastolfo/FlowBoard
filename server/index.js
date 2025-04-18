import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv"
import http from "http";
import { Server } from "socket.io";
import fetch_router from "./routers/fetch_router.js";
import user_router from "./routers/user_router.js"
import board_router from "./routers/board_router.js"

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
  origin: "http://localhost:5173", 
  methods: ["GET", "POST", "DELETE", "PUT"],
  credentials: true
};

app.use(cors(corsOptions));
const server = http.createServer(app); // create HTTP server for socket.io

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // allow frontend 
    methods: ["GET", "POST", "DELETE", "PUT"],
    credentials: true, //  can't to use *
  }
});

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors());

// expose io to routes via app.locals
app.locals.io = io;
// Socket.io events
io.on("connection", (socket) => {
  console.log("New WebSocket connection:", socket.id);

  socket.on("disconnect", () => {
    console.log("A WebSocket disconnected:", socket.id);
  });
});

// routes
app.use("/fetch", fetch_router);
app.use("/user", user_router)
app.use("/board", board_router)

app.get("/", (req, res) => {
  res.send("Welcome to the server");
});

// app.listen(PORT, () => {
//   console.log(`http://localhost:${PORT}`);
// });

app.use((req, res) => {
  res.send(`No request for ${req.url} exists`);
});

console.log('MongoDB URL:', process.env.MONGODB_URL);

// Database connection
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Connected to MongoDB");
    server.listen(PORT, () =>
      console.log(`Server (with WebSocket) running on http://localhost:${PORT}`)
    );
  })


