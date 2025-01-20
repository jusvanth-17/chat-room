const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
    user: { type: String, required: true },
    message: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
