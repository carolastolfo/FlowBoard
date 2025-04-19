import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true, // doesn't allow cors: origin * at the server
  autoConnect: true, // prevent auto connection
  transports: ["polling"], // Only temporarily
});

export default socket;
