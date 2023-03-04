import dotenv from 'dotenv';
dotenv.config()
import express, { Router } from 'express';
import cors from 'cors';

import './database.js';
import  {globalError }  from './middleware/globalError.js';
// import router from './route.js';
const app = express()

import http from 'http'
var server = http.createServer(app);

import { Server } from 'socket.io';
import register , {login}  from './controller/user.js';
// const io = new Server(server);
const io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

app.use(express.json())
app.use(cors())

io.on("connection", (socket) => {
    // console.log(socket.id)
  
    socket.on("joinRoom", data => {
            // console.log(room);
          socket.join(data.room)
          socket.broadcast.emit('user-joined',data.room)
    })
  
    socket.on("newMessage", ({newMessage, room}) => {
        console.log(newMessage , room);
      io.in(room).emit("getLatestMessage", newMessage)
    })
  
  });


// app.use('/' , router)

app.get('/' , (req,res)=>{
  res.send('this our Chatting App server ')
})
app.post('/register' , register)
app.post('/login' , login)

app.use(globalError)


server.listen(process.env.PORT , ()=>{
    console.log(`App is Running on ${process.env.PORT}`);
})

