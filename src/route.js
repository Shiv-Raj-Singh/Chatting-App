import { Router } from "express";
import register, {
  fetchNews,
  forgetPassword,
  isValidToken,
  login,
  resetPassword,
  sendMessage,
} from "./controller/user.js";
import AppError from "./middleware/AppError.js";
const router = Router();
export default router;

router.get("/", (req, res) => {
  // send json response
  res.status(200).json({
    status: true,
    message: "Welcome to Chatting App",
  });
});

// get homepage
router.get("/home", fetchNews);
router.post("/register", register);
router.post("/login", login);
router.post("/forgotPassword", forgetPassword);
router.put("/resetPassword/:id", resetPassword);
router.get("/auth", isValidToken);
router.post("/contact", sendMessage);

router.all("/*", (req, res, next) => {
  next(new AppError(`${req.url} Not Found !`, 404));
});
