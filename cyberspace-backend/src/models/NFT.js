const mongoose = require('mongoose');

const NFTSchema = new mongoose.Schema({
    name: { type: String, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Space" },
    metadata: { type: Object }, // Enthält z. B. Bild-URLs, 3D-Modelle, etc.
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("NFT", NFTSchema);

