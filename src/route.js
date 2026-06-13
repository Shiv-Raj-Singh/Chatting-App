import { Router } from "express";
import register, { fetchNews, forgetPassword, isValidToken, login, resetPassword, sendMessage } from "./controller/user.js";
import { getRooms, createRoom, deleteRoom, blockUser, getRoomMessages } from "./controller/room.js";
import protect from "./middleware/auth.js";
import AppError from "./middleware/AppError.js";

const router = Router();
export default router;

router.get("/", (req, res) => res.status(200).json({ status: true, message: "Welcome to NexChat API" }));

// Auth
router.post("/register", register);
router.post("/login", login);
router.get("/auth", isValidToken);
router.post("/forgotPassword", forgetPassword);
router.put("/resetPassword/:id", resetPassword);
router.post("/contact", sendMessage);

// News
router.get("/home", fetchNews);

// Rooms (protected)
router.get("/rooms", protect, getRooms);
router.post("/rooms", protect, createRoom);
router.delete("/rooms/:roomId", protect, deleteRoom);
router.post("/rooms/:roomId/block", protect, blockUser);
router.get("/rooms/:roomId/messages", protect, getRoomMessages);

router.all("/*", (req, res, next) => next(new AppError(`${req.url} Not Found!`, 404)));
