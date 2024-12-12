import bcrypt from "bcrypt";
import userModel from "../model/register.js";
import validUser from "../model/validUser.js";
import catchAsync from "./catchAsync.js";
import AppError from "../middleware/AppError.js";
import axios from "axios";

// Nodemailer Provide the system to send the email from Nodejs
import nodemailer from "nodemailer";
import { generateJwtToken, verifyJwtToken } from "../utility.js";

// const twilio = require('twilio');
import twilio from "twilio";

// Replace these with your Twilio credentials
const accountSid = process.env.ACCOUNT_SID; // Replace with your Account SID
const authToken = process.env.ACCOUNT_TOKEN; // Replace with your Auth Token

// Create a Twilio client
const client = new twilio(accountSid, authToken);

// Send SMS function
const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body: body, // Message text
      to: to, // Recipient's phone number
      from: process.env.PHONE, // Your Twilio phone number (with country code)
    });

    console.log("Message sent:", message.sid);
    return message;
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
};

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
  console.log(process.env.email, process.env.ePassword);
  const userData = await validUser.validateAsync(req.body);
  const user = await userModel.findOne({ email: userData.email });
  if (!user) return next(new AppError("User Not Exist", 404));

  // res.status(200).json({
  //     status : true , data : user , message : 'Password Updated Successfully'
  // })

  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing

  const testAccount = await nodemailer.createTestAccount();
  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: `${process.env.email}`,
      pass: `${process.env.pass}`,
    },
  });

  var mailOptions = {
    from: `${process.env.email}`,
    to: `${userData.email}`,
    // to: `mt932747@gmail.com`,
    // to: `shiv9627347143@gmail.com`,
    // to: `albertsaurabhkumar@gmail.com`,
    subject: "Reset Your Password",
    html: '<a href="`https://chat-app-frontend-sigma.vercel.app/reset-password/${user._id}`">Click Here For Reset Your Password ! </a>',
  };

  await transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    } else {
      console.log("Email sent: " + info);

      res.status(200).json({
        status: true,
        message: "Email Sent Successfully See Your Email Account !",
        data: info,
      });
    }
  });
  // console.log(userData);
});

const resetPassword = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const userData = await validUser.validateAsync(req.body);
  // console.log(id , userData);
  if (userData.password !== userData.cPassword) {
    return next(new AppError("Both Password are Not Match !"));
  }
  const user = await userModel.findById({ _id: id });
  if (!user) return next(new AppError("User Not Exist", 404));

  user.password = userData.password;
  user.cPassword = userData.cPassword;
  await user.save();
  res.status(200).json({
    status: true,
    data: user,
    message: "Password Updated Successfully",
  });
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
