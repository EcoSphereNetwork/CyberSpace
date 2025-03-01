module.exports = (io) => {
    io.on("connection", (socket) => {
        console.log(`🔗 WebRTC: Neuer Benutzer verbunden - ${socket.id}`);

        socket.on("join_room", (room) => {
            socket.join(room);
            socket.to(room).emit("user_joined", { user: socket.id });
        });

        socket.on("offer", (data) => {
            socket.to(data.room).emit("receive_offer", data);
        });

        socket.on("answer", (data) => {
            socket.to(data.room).emit("receive_answer", data);
        });

        socket.on("ice_candidate", (data) => {
            socket.to(data.room).emit("receive_candidate", data);
        });

        socket.on("disconnect", () => {
            console.log(`🔌 Benutzer ${socket.id} getrennt`);
        });
    });
};

const { ExpressPeerServer } = require("peer");

module.exports = (server) => {
    const peerServer = ExpressPeerServer(server, {
        debug: true,
        path: "/webrtc"
    });

    return peerServer;
};

