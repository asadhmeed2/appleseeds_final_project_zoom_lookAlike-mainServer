const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
let messages=[]



io.on("connection",(socket)=>{
    socket.on("get all messages",()=>{
        io.emit("all messages", messages);               
    })
    socket.on("message",({userName,message})=>{
        messages.push({userName:userName,message:message})
        io.emit("all messages", messages);               
      })
})


server.listen(process.env.PORT || 4001, () => {
    console.log(`listening of port ${process.env.PORT || 4001}`);
  });