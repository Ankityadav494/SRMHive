const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const projectRoutes = require("./routes/projectRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const Message = require("./models/Message");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// 🔥 Socket setup
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// 🔥 Make io accessible in controllers
app.set("io", io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🔥 Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🔹 Join project chat room
  socket.on("joinProject", (projectId) => {
    socket.join(projectId);
  });

  // 🔹 Join user room (for notifications)
  socket.on("joinUser", (userId) => {
    socket.join(userId);
  });

  // 🔹 Send message (chat)
  socket.on("sendMessage", async (data) => {
    const { projectId, senderId, text } = data;

    const message = await Message.create({
      project: projectId,
      sender: senderId,
      text,
    });

    io.to(projectId).emit("receiveMessage", message);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);