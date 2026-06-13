import bcrypt from "bcrypt";
import userModel from "../model/register.js";
import validUser from "../model/validUser.js";
import catchAsync from "./catchAsync.js";
import AppError from "../middleware/AppError.js";
import axios from "axios";

// Nodemailer Provide the system to send the email from Nodejs
import nodemailer from "nodemailer";
import { generateJwtToken, verifyJwtToken } from "../utility.js";

const register = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const userData = await validUser.validateAsync(req.body);
  if (userData.password !== userData.cPassword) {
    return next(new AppError("Both Password are Not Match !"));
  }
  let user = await userModel.create(userData);
  user = { ...JSON.parse(JSON.stringify(user)) };
  console.log("User got created : ", JSON.stringify(user));

  const objectForAuth = {
    userId: user._id,
    email: user.email,
    phone: user.phone,
  };
  const jwtToken = generateJwtToken(objectForAuth);
  user.token = jwtToken;
  // set token into cookies
  res.cookie("jwtToken", jwtToken, { httpOnly: true, secure: true });
  res.status(201).json({
    status: true,
    data: user,
  });
});

const login = catchAsync(async (req, res, next) => {
  console.log(req.body);
  //   const userData = await validUser.validateAsync(req.body);
  //   const dataForLogin = userData.phone || userData.email;

  let user = await userModel.findOne({
    $or: [{ phone: req.body.phone }, { email: req.body.email }],
  });

  if (!user) return next(new AppError("User Not Exist", 404));
  const validPass = await bcrypt.compare(req.body.password, user.password);
  user = { ...JSON.parse(JSON.stringify(user)) };

  if (!validPass) return next(new AppError("Incorrect Password !", 401));

  const objectForAuth = {
    userId: user._id,
    email: user.email,
    phone: user.phone,
  };
  const jwtToken = generateJwtToken(objectForAuth);
  user.token = jwtToken;
  // set token into cookies
  res.cookie("jwtToken", jwtToken, {
    httpOnly: true,
    secure: false, // Set true if using HTTPS
    sameSite: "lax", // Prevent CSRF; use 'strict' or 'none' if needed
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res
    .status(200)
    .json({ status: true, message: "login Successfully Database", data: user });
});

// IsValid JWT Token in cookies
const isValidToken = catchAsync(async (req, res, next) => {
  // get token from authorization headers
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return next(new AppError("Token Not Found !", 404));

  const decoded = verifyJwtToken(token);
  if (!decoded) return next(new AppError("Invalid Token !", 401));

  // token is valid return success response
  return res.status(200).json({
    status: true,
    message: "Token is Valid",
    data: decoded,
  });
});

// need to send message over phone and mail also using sendSMS and nodeMailer
export const sendMessage = catchAsync(async (req, res, next) => {
  const body = req.body;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.email}`,
      pass: `${process.env.pass}`,
    },
  });

  var mailOptions = {
    to: `${process.env.email}`,
    from: `${body.email}`,

    // to: `mt932747@gmail.com`,
    // to: `shiv9627347143@gmail.com`,
    // to: `albertsaurabhkumar@gmail.com`,
    subject: "Someone wants you to contact through chatting app.",
    html: `<h3> Name : ${body.name} </h3> <h5> Email : ${body.email} </h5> <h6> Message : ${body.message} </h6>`,
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Email sent: " + info);

      res.status(200).json({
        status: true,
        message: "Email Sent Successfully, thanks for contacting us.",
        data: info,
      });
    }
  });
});

//    Email send sing NodeMailer**********************************************************************************

const forgetPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Email is required", 400));

  const user = await userModel.findOne({ email });
  if (!user) return next(new AppError("No account found with that email", 404));

  const frontendUrl = process.env.FRONTEND_URL || "https://mangal-chat-app.vercel.app";
  const resetLink = `${frontendUrl}/reset-password/${user._id}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.email,
      pass: process.env.pass,
    },
  });

  const mailOptions = {
    from: process.env.email,
    to: email,
    subject: "Reset Your NexChat Password",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;background:#0f0f1a;color:#e2e8f0;border-radius:16px;">
        <h2 style="background:linear-gradient(135deg,#7c3aed,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin:0 0 16px">NexChat</h2>
        <p>You requested a password reset. Click the button below to choose a new password:</p>
        <a href="${resetLink}" style="display:inline-block;margin:24px 0;padding:14px 28px;background:linear-gradient(135deg,#7c3aed,#06b6d4);color:#fff;text-decoration:none;border-radius:12px;font-weight:600;">Reset Password</a>
        <p style="color:#94a3b8;font-size:13px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  res.status(200).json({ status: true, message: "Password reset link sent to your email." });
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { password, cPassword } = req.body;

  if (!password || !cPassword) return next(new AppError("Both password fields are required", 400));
  if (password !== cPassword) return next(new AppError("Passwords do not match", 400));
  if (password.length < 8) return next(new AppError("Password must be at least 8 characters", 400));

  const user = await userModel.findById(id);
  if (!user) return next(new AppError("User not found", 404));

  user.password = password;
  user.cPassword = cPassword;
  await user.save();

  res.status(200).json({ status: true, message: "Password updated successfully. Please log in." });
});

// pull latest news
const fetchNews = catchAsync(async (req, res, next) => {
  const { q, language } = req.query || {};
  const response = await axios.get("https://newsapi.org/v2/everything", {
    params: {
      apiKey: "127c17c8a5f643aab718e5985a67a4fb",
      q: q || "latest",
      language: language || "en",
      sortBy: "relevancy",
    },
  });
  // res.json(response.data);
  console.log("Response from fetchNews : ", JSON.stringify(response.data));
  res.status(200).json({
    status: true,
    data: response.data,
    message: "News Fetched Successfully",
  });
});

export default register;
export { login, forgetPassword, resetPassword, isValidToken, fetchNews };
