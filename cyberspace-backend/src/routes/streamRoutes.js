const express = require('express');
const router = express.Router();
const { Server } = require("socket.io");

module.exports = (server) => {
    const io = new Server(server, { cors: { origin: "*" } });

    router.post('/start', (req, res) => {
        const { gameId, userId } = req.body;
        io.emit("stream_started", { gameId, userId });
        res.json({ message: "Stream gestartet", gameId });
    });

    router.post('/stop', (req, res) => {
        const { gameId, userId } = req.body;
        io.emit("stream_stopped", { gameId, userId });
        res.json({ message: "Stream gestoppt", gameId });
    });

    return router;
};

