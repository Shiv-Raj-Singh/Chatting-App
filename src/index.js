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

// ── BOT CONFIG ────────────────────────────────────────────────
let botUsers = [];

const BOTS_SEED = [
  { name: "NexBot",    phone: "0000000001", email: "nexbot@nex.chat",    avatarColor: "#7c3aed", gender: "other", password: "NexBot@Pass1!", cPassword: "NexBot@Pass1!", isBot: true },
  { name: "AskMe",     phone: "0000000002", email: "askme@nex.chat",     avatarColor: "#06b6d4", gender: "other", password: "AskMe@Pass2!",  cPassword: "AskMe@Pass2!",  isBot: true },
  { name: "ChatBuddy", phone: "0000000003", email: "chatbuddy@nex.chat", avatarColor: "#ec4899", gender: "other", password: "Buddy@Pass3!",  cPassword: "Buddy@Pass3!",  isBot: true },
];

const RESPONSES = {
  general: [
    "Great to see people chatting here! 😊",
    "What does everyone think about that? 🤔",
    "Love the energy in this room! 🔥",
    "This is exactly the kind of discussion I love ❤️",
    "Keep it coming, I'm listening 👂",
    "Couldn't agree more! 💯",
    "Anyone else have thoughts? 💬",
    "Interesting perspective! Tell us more 👇",
  ],
  random: [
    "Fun fact: Honey never expires 🍯",
    "Plot twist incoming 👀",
    "That's hilarious 😂 totally didn't see that coming",
    "Someone give this person a medal 🏅",
    "Okay this made my day 😄",
    "Living for this conversation right now",
    "Random but I love it 🎲",
  ],
  tech: [
    "Have you tried turning it off and on again? 😄",
    "Fascinating architecture decision!",
    "Stack Overflow to the rescue! 💪",
    "Clean code is happy code ✨",
    "Rubber duck debugging always works 🦆",
    "Works on my machine 🤷",
    "90% of bugs are between keyboard and chair 😄",
    "Ship it! We'll fix bugs in prod 🚀",
  ],
  greeting: [
    "Hey there! 👋 Welcome to NexChat!",
    "Hello! Great to have you here 😊",
    "Hi! How's everyone doing today? 🌟",
    "Hey! Glad you joined the conversation 👋",
  ],
  question: [
    "Great question! Anyone want to answer? 🤔",
    "Hmm, I'm curious too! Let's discuss 💭",
    "Good one — might have to Google that 😄",
    "I was just wondering the same thing!",
  ],
};

const getBotResponse = (content, roomName) => {
  const lower = content.toLowerCase();
  if (/\b(hi|hello|hey|hola|howdy)\b/.test(lower))
    return RESPONSES.greeting[Math.floor(Math.random() * RESPONSES.greeting.length)];
  if (lower.includes('?'))
    return RESPONSES.question[Math.floor(Math.random() * RESPONSES.question.length)];
  const pool = RESPONSES[roomName] || RESPONSES.general;
  return pool[Math.floor(Math.random() * pool.length)];
};

const triggerBotResponse = async (roomId, roomName, messageContent, senderUserId) => {
  if (botUsers.some((b) => b._id.toString() === senderUserId)) return;
  if (Math.random() > 0.40) return; // 40% chance

  const bot = botUsers[Math.floor(Math.random() * botUsers.length)];
  const delay = 1500 + Math.random() * 2500;

  setTimeout(() => {
    io.to(roomId).emit("typing", { userId: bot._id.toString(), name: bot.name, roomId, isTyping: true });
  }, Math.max(0, delay - 1200));

  setTimeout(async () => {
    try {
      io.to(roomId).emit("typing", { userId: bot._id.toString(), name: bot.name, roomId, isTyping: false });
      const content = getBotResponse(messageContent, roomName);
      const msg = await Message.create({ room: roomId, sender: bot._id, content });
      await msg.populate("sender", "name avatarColor");
      io.to(roomId).emit("newMessage", {
        _id: msg._id, roomId,
        sender: { _id: msg.sender._id, name: msg.sender.name, avatarColor: msg.sender.avatarColor },
        content: msg.content, createdAt: msg.createdAt,
      });
    } catch (_) {}
  }, delay);
};

// ── SEEDING ───────────────────────────────────────────────────
const seedDefaultRooms = async () => {
  const defaults = [
    { name: "general", description: "General discussion for everyone", emoji: "💬", isDefault: true },
    { name: "random",  description: "Off-topic conversations & fun",   emoji: "🎲", isDefault: true },
    { name: "tech",    description: "Tech talk, coding & dev tools",   emoji: "💻", isDefault: true },
  ];
  for (const room of defaults) {
    await Room.findOneAndUpdate({ name: room.name }, room, { upsert: true, new: true });
  }
  console.log("✅ Default rooms ready");
};

const seedBots = async () => {
  botUsers = [];
  for (const bot of BOTS_SEED) {
    let existing = await userModel.findOne({ email: bot.email });
    if (!existing) {
      existing = await userModel.create(bot);
    }
    botUsers.push(existing);
  }
  console.log(`✅ ${botUsers.length} bots ready`);
};

// ── RUNTIME STATE ─────────────────────────────────────────────
// socketId → { userId, name, avatarColor }
const onlineUsers = new Map();
// roomId → Set<userId>  (in-memory occupancy, resets on restart)
const roomOccupancy = new Map();

const getRoomCount = (roomId) => roomOccupancy.get(roomId)?.size || 0;

const joinOccupancy = (roomId, userId) => {
  if (!roomOccupancy.has(roomId)) roomOccupancy.set(roomId, new Set());
  roomOccupancy.get(roomId).add(userId);
};

const leaveOccupancy = (roomId, userId) => {
  roomOccupancy.get(roomId)?.delete(userId);
};

// ── SOCKET ────────────────────────────────────────────────────
io.on("connection", (socket) => {
  // ── AUTHENTICATE ──────────────────────────────────────────
  socket.on("authenticate", async ({ token }) => {
    try {
      const decoded = verifyJwtToken(token);
      if (!decoded) { socket.emit("authError", { message: "Invalid token" }); return; }

      const user = await userModel.findById(decoded.userId).select("name avatarColor email isBot").lean();
      if (!user) { socket.emit("authError", { message: "User not found" }); return; }

      socket.userId = user._id.toString();
      socket.userName = user.name;
      socket.avatarColor = user.avatarColor || "#7c3aed";

      onlineUsers.set(socket.id, { userId: socket.userId, name: user.name, avatarColor: socket.avatarColor });

      socket.emit("authenticated", { user: { _id: user._id, name: user.name, avatarColor: user.avatarColor } });
      socket.emit("onlineUsers", Array.from(onlineUsers.values()));
      socket.broadcast.emit("userOnline", { userId: socket.userId, name: user.name, avatarColor: socket.avatarColor });
    } catch (_) {
      socket.emit("authError", { message: "Authentication failed" });
    }
  });

  // ── JOIN ROOM ─────────────────────────────────────────────
  socket.on("joinRoom", async ({ roomId }) => {
    if (!socket.userId) return;
    try {
      const room = await Room.findById(roomId).lean();
      if (!room) { socket.emit("joinError", { roomId, message: "Room not found" }); return; }

      if (room.blockedUsers?.some((id) => id.toString() === socket.userId)) {
        socket.emit("joinError", { roomId, message: "You have been removed from this room" });
        return;
      }

      if (room.maxMembers && getRoomCount(roomId) >= room.maxMembers) {
        socket.emit("joinError", { roomId, message: `Room is full (max ${room.maxMembers} members)` });
        return;
      }

      socket.join(roomId);
      joinOccupancy(roomId, socket.userId);

      socket.to(roomId).emit("userJoined", { userId: socket.userId, name: socket.userName, roomId });
      socket.emit("roomJoined", { roomId });
      // Broadcast updated member count to everyone in the room
      io.to(roomId).emit("memberCount", { roomId, count: getRoomCount(roomId) });
    } catch (err) {
      socket.emit("joinError", { roomId, message: "Failed to join room" });
    }
  });

  // ── LEAVE ROOM ────────────────────────────────────────────
  socket.on("leaveRoom", ({ roomId }) => {
    socket.leave(roomId);
    leaveOccupancy(roomId, socket.userId);
    socket.to(roomId).emit("userLeft", { userId: socket.userId, name: socket.userName, roomId });
    io.to(roomId).emit("memberCount", { roomId, count: getRoomCount(roomId) });
  });

  // ── SEND MESSAGE ──────────────────────────────────────────
  socket.on("sendMessage", async ({ roomId, content }) => {
    if (!socket.userId || !content?.trim()) return;
    try {
      const msg = await Message.create({ room: roomId, sender: socket.userId, content: content.trim() });
      await msg.populate("sender", "name avatarColor");

      io.to(roomId).emit("newMessage", {
        _id: msg._id, roomId,
        sender: { _id: msg.sender._id, name: msg.sender.name, avatarColor: msg.sender.avatarColor },
        content: msg.content, createdAt: msg.createdAt,
      });

      // Bot auto-response (only in default rooms to keep things lively)
      const room = await Room.findById(roomId).select("name isDefault").lean();
      if (room?.isDefault) {
        triggerBotResponse(roomId, room.name, content.trim(), socket.userId);
      }
    } catch (_) {
      socket.emit("messageError", { message: "Failed to send message" });
    }
  });

  // ── NEW ROOM (broadcast to all others) ───────────────────
  socket.on("newRoom", (room) => {
    socket.broadcast.emit("roomCreated", room);
  });

  // ── DELETE ROOM ───────────────────────────────────────────
  socket.on("deleteRoom", ({ roomId }) => {
    if (!socket.userId) return;
    io.to(roomId).emit("roomDeleted", { roomId });
    io.in(roomId).socketsLeave(roomId);
    roomOccupancy.delete(roomId);
  });

  // ── KICK USER ─────────────────────────────────────────────
  socket.on("kickUser", ({ roomId, userId }) => {
    if (!socket.userId) return;
    for (const [sid, info] of onlineUsers.entries()) {
      if (info.userId === userId) {
        const target = io.sockets.sockets.get(sid);
        if (target) {
          target.leave(roomId);
          leaveOccupancy(roomId, userId);
          target.emit("kicked", { roomId, by: socket.userName });
          io.to(roomId).emit("memberCount", { roomId, count: getRoomCount(roomId) });
        }
      }
    }
  });

  // ── DIRECT INVITE ─────────────────────────────────────────
  socket.on("inviteUser", ({ roomId, roomName, roomEmoji, toUserId }) => {
    if (!socket.userId) return;
    for (const [sid, info] of onlineUsers.entries()) {
      if (info.userId === toUserId) {
        const target = io.sockets.sockets.get(sid);
        if (target) {
          target.emit("roomInvite", {
            roomId, roomName, roomEmoji,
            from: socket.userName,
            fromId: socket.userId,
          });
        }
      }
    }
  });

  // ── TYPING ────────────────────────────────────────────────
  socket.on("typing", ({ roomId, isTyping }) => {
    if (!socket.userId) return;
    socket.to(roomId).emit("typing", { userId: socket.userId, name: socket.userName, roomId, isTyping });
  });

  // ── DISCONNECT ────────────────────────────────────────────
  socket.on("disconnect", () => {
    if (socket.userId) {
      socket.broadcast.emit("userOffline", { userId: socket.userId, name: socket.userName });
      // Clean up all room occupancy for this user
      for (const [roomId] of roomOccupancy.entries()) {
        leaveOccupancy(roomId, socket.userId);
      }
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
  await seedBots();
});
