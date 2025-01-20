const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Server } = require("socket.io");
const http = require("http");
require("dotenv").config();

const ChatMessage = require("./models/chatmessage");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// CORS Middleware for Express
app.use(cors({
    origin: "http://localhost:3000",  // Allow frontend requests
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
}));

// Middleware to handle CORS for WebSocket connections
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",  // Allow WebSocket connections from the frontend
        methods: ["GET", "POST"],
    },
});

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);

    socket.on("send_message", async (data) => {
        const { user, message } = data;
        if (!user || !message) return;

        const chatMessage = new ChatMessage({ user, message });
        await chatMessage.save();

        io.emit("receive_message", chatMessage);
    });

    socket.on("disconnect", () => {
        console.log(`User Disconnected: ${socket.id}`);
    });
});

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/ChatDB")
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("MongoDB connection error:", err));

// REST API Routes
app.get("/messages", async (req, res) => {
    try {
        const messages = await ChatMessage.find();
        res.json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.post("/messages", async (req, res) => {
    try {
        const { user, message } = req.body;

        if (!user || !message) {
            return res.status(400).json({ error: "User and message are required" });
        }

        const chatMessage = new ChatMessage({ user, message });
        await chatMessage.save();

        res.status(201).json(chatMessage);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
