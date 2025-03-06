import express from "express";
import cors from "cors";
import fetch_router from "./routers/fetch_router.js";

const app = express();
const PORT = process.env.PORT || 8000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// routes
app.use("/fetch", fetch_router);

app.get("/", (req, res) => { 
  res.send("Welcome to the server");
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});

app.use( (req, res) => {
  res.send(`No request for ${req.url} exists`);
});