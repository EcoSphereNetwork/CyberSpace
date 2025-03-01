const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });

const peerServer = require("./webrtc");

app.use(express.json());
app.use(cors());
app.use(helmet());

// API-Routen registrieren
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/nft', require('./routes/nftRoutes'));
app.use('/api/spaces', require('./routes/spaceRoutes'));
app.use('/api/portals', require('./routes/portalRoutes'));
app.use('/peerjs', peerServer(server));
app.use('/api/stream', require('./routes/streamRoutes')(server));

// WebSocket-Server für Spaces & Multiplayer-Kommunikation
io.on('connection', (socket) => {
    console.log('🔗 Neuer User verbunden');

    socket.on('join_space', (data) => {
        console.log(`${data.user_id} ist einem Space beigetreten`);
        socket.join(data.space_id);
    });

    socket.on('update_space', (data) => {
        io.to(data.space_id).emit('space_updated', data);
    });
});

// WebRTC in bestehenden WebSocket-Server integrieren
const startWebRTC = require("./webrtc");
startWebRTC(io);  // io wird hier korrekt übergeben!

// Server starten
server.listen(process.env.PORT, () => {
    connectDB();
    console.log(`🚀 Server läuft auf Port ${process.env.PORT}`);
});

