const mongoose = require('mongoose');

const SpaceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    description: { type: String },
    isPublic: { type: Boolean, default: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Space", SpaceSchema);

