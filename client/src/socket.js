import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true, // doesn't allow cors: origin * at the server
  autoConnect: true, // prevent auto connection
  transports: ["websocket"], // avoid polling fallback
});

export default socket;
