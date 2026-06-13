import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import "./database.js";
import { globalError } from "./middleware/globalError.js";
import router from "./route.js";
import { verifyJwtToken } from "./utility.js";
import userModel from "./model/register.js";
import Room from "./model/room.js";
import Message from "./model/message.js";

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const io = new Server(server, { cors: corsOptions });

const seedDefaultRooms = async () => {
  const defaults = [
    { name: "general", description: "General discussion for everyone", emoji: "💬", isDefault: true },
    { name: "random", description: "Off-topic conversations & fun", emoji: "🎲", isDefault: true },
    { name: "tech", description: "Tech talk, coding & dev tools", emoji: "💻", isDefault: true },
  ];
  for (const room of defaults) {
    await Room.findOneAndUpdate({ name: room.name }, room, { upsert: true, new: true });
  }
  console.log("✅ Default rooms ready");
};

// socketId → { userId, name, avatarColor }
const onlineUsers = new Map();

io.on("connection", (socket) => {
  // ── AUTHENTICATE ──────────────────────────────────────────
  socket.on("authenticate", async ({ token }) => {
    try {
      const decoded = verifyJwtToken(token);
      if (!decoded) { socket.emit("authError", { message: "Invalid token" }); return; }

      const user = await userModel.findById(decoded.userId).select("name avatarColor email").lean();
      if (!user) { socket.emit("authError", { message: "User not found" }); return; }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.avatarColor = user.avatarColor || "#7c3aed";

      onlineUsers.set(socket.id, {
        userId: socket.userId,
        name: user.name,
        avatarColor: socket.avatarColor,
      });

      socket.emit("authenticated", { user: { _id: user._id, name: user.name, avatarColor: user.avatarColor } });
      socket.emit("onlineUsers", Array.from(onlineUsers.values()));
      socket.broadcast.emit("userOnline", { userId: socket.userId, name: user.name, avatarColor: socket.avatarColor });
    } catch (err) {
      socket.emit("authError", { message: "Authentication failed" });
    }
  });

  // ── JOIN ROOM ─────────────────────────────────────────────
  socket.on("joinRoom", async ({ roomId }) => {
    if (!socket.userId) return;
    try {
      const room = await Room.findById(roomId).lean();
      if (room?.blockedUsers?.some((id) => id.toString() === socket.userId)) {
        socket.emit("joinError", { roomId, message: "You have been removed from this room" });
        return;
      }
    } catch (_) {}
    socket.join(roomId);
    socket.to(roomId).emit("userJoined", { userId: socket.userId, name: socket.userName, roomId });
    socket.emit("roomJoined", { roomId });
  });

  // ── LEAVE ROOM ────────────────────────────────────────────
  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
    socket.to(roomId).emit("userLeft", { userId: socket.userId, name: socket.userName, roomId });
  });

  // ── SEND MESSAGE ──────────────────────────────────────────
  socket.on("sendMessage", async ({ roomId, content }) => {
    if (!socket.userId || !content?.trim()) return;
    try {
      const msg = await Message.create({ room: roomId, sender: socket.userId, content: content.trim() });
      await msg.populate("sender", "name avatarColor");

      io.to(roomId).emit("newMessage", {
        _id: msg._id,
        roomId,
        sender: { _id: msg.sender._id, name: msg.sender.name, avatarColor: msg.sender.avatarColor },
        content: msg.content,
        createdAt: msg.createdAt,
      });
    } catch (err) {
      socket.emit("messageError", { message: "Failed to send message" });
    }
  });

  // ── NEW ROOM (broadcast to all others) ───────────────────
  socket.on("newRoom", (room) => {
    socket.broadcast.emit("roomCreated", room);
  });

  // ── DELETE ROOM (broadcast to everyone) ──────────────────
  socket.on("deleteRoom", ({ roomId }) => {
    if (!socket.userId) return;
    io.to(roomId).emit("roomDeleted", { roomId });
    io.in(roomId).socketsLeave(roomId);
  });

  // ── KICK USER FROM ROOM ───────────────────────────────────
  socket.on("kickUser", ({ roomId, userId }) => {
    if (!socket.userId) return;
    for (const [sid, info] of onlineUsers.entries()) {
      if (info.userId === userId) {
        const target = io.sockets.sockets.get(sid);
        if (target) {
          target.leave(roomId);
          target.emit("kicked", { roomId, by: socket.userName });
        }
      }
    }
  });

  // ── TYPING ────────────────────────────────────────────────
  socket.on("typing", ({ roomId, isTyping }) => {
    if (!socket.userId) return;
    socket.to(roomId).emit("typing", {
      userId: socket.userId,
      name: socket.userName,
      roomId,
      isTyping,
    });
  });

  // ── DISCONNECT ────────────────────────────────────────────
  socket.on("disconnect", () => {
    if (socket.userId) {
      socket.broadcast.emit("userOffline", { userId: socket.userId, name: socket.userName });
    }
    onlineUsers.delete(socket.id);
  });
});

app.use("/", router);
app.use(globalError);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 NexChat server running on port ${PORT}`);
  await seedDefaultRooms();
});
