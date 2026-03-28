import { io } from "socket.io-client";

const socket = io("https://srmhive.onrender.com");

export default socket;