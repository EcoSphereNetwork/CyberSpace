import { Socket } from "socket.io-client";

declare global {
  interface WebSocket extends Socket {}
}
