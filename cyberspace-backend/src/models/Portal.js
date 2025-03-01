const mongoose = require('mongoose');

const PortalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    targetGame: { type: String, required: true },
    targetURL: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Portal", PortalSchema);

