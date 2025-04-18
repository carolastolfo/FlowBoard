import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_SERVER_URL, {
  withCredentials: true, //can't cors: origin * at the server(index.js)
  autoConnect: true, // prevent auto connection
  transports: ["websocket"], // avoid polling fallback
});

export default socket;
