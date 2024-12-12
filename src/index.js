import dotenv from "dotenv";
dotenv.config();
import express, { Router } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./database.js";
import { globalError } from "./middleware/globalError.js";
import router from "./route.js";
const app = express();
// Use cookie-parser middleware
app.use(cookieParser());

import http from "http";
var server = http.createServer(app);
// const io = new Server(server);

const corsPolicyFields = {
  origin: "*", // Replace with your frontend's URL
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  credentials: true, // Allow cookies to be sent with requests
};
app.use(cors(corsPolicyFields));

app.use(express.json());

import { Server } from "socket.io";
const io = new Server(server, {
  cors: corsPolicyFields,
});

// io.on("connection", (socket) => {
//   // console.log(socket.id)

//   socket.on("joinRoom", (data) => {
//     // console.log(room);
//     socket.join(data.room);
//     socket.broadcast.emit("user-joined", data.room);
//   });

//   socket.on("newMessage", ({ newMessage, room }) => {
//     console.log(newMessage, room);
//     io.in(room).emit("getLatestMessage", newMessage);
//   });
// });
const users = []; // List to store connected users

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle user joining chat
  socket.on("joinDirectChat", ({ username }) => {
    users.push({ username, socketId: socket.id });
    io.emit("user-joined", username); // Inform other users

    // Emit updated user list after someone joins
    io.emit(
      "usersList",
      users.map((user) => user.username)
    ); // Send updated users list to all clients
  });

  // Handle receiving direct messages
  socket.on("newDirectMessage", (message) => {
    console.log("Received direct message: ", message);
    io.emit("getLatestMessage", message);
  });

  // Handle users requesting the current list of users
  socket.on("usersList", () => {
    io.emit(
      "usersList",
      console.log("usersList....", usersList),
      users.map((user) => user.username)
    ); // Emit the list of users
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    const disconnectedUserIndex = users.findIndex(
      (user) => user.socketId === socket.id
    );
    if (disconnectedUserIndex > -1) {
      users.splice(disconnectedUserIndex, 1); // Remove disconnected user
    }
  });
});

app.use("/", router);
app.use(globalError);

server.listen(process.env.PORT, () => {
  console.log(`App is Running on ${process.env.PORT}`);
});
