import { useRef, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useWebSocket = () => {
  const socketRef = useRef<Socket>();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_WS_URL || "ws://localhost:3001");

    socketRef.current.on("connect", () => {
      setIsConnected(true);
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
  };
};
