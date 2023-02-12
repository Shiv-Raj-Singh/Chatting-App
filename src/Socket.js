import  server from './index.js'
import io from ("socket-io")



io.on('connection', () => { /* … */ });
server.listen(3000);
io.on("connection", (socket) => {
    console.log(socket.id)
  
    socket.on("joinRoom", room => {
          socket.join(room)
    })
  
    socket.on("newMessage", ({newMessage, room}) => {
      io.in(room).emit("getLatestMessage", newMessage)
    })
  
  });