const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
require("dotenv").config()
const bodyParser = require("body-parser");
const loginRouter = require("./routes/login.route")
const adminRouter = require("./routes/admin.route")
const mongoose =require("mongoose");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
let users = {};//save users  ids that connected to particular room with room id key
let usersUniqids = {};//save users  ids that connected to particular room with room id key
let roomsLinks ={}
let socketToRoom = {};// save users id and witch room thear in  
let uniqidToRoom = {};// save users unique id and witch room thear in (to check if the user all ready in the room)  
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join room", room => {
    if (users[room.roomID]) {//if there is some one connected to the room 
        let user = users[room.roomID].find(user => user.uniqid === room.uniqid)
        console.log(user);
        if(!user){
          users[room.roomID].push({id:socket.id,uniqid:room.uniqid}); // add the new user socket id to the room  
        }else{
          console.log('user is all ready in the room');
          return
        }
    } else {
        users[room.roomID] = [{id:socket.id,uniqid:room.uniqid}];//initialize the room weth the first user socket id 
        
    }
    socketToRoom[socket.id] = room.roomID; //add the user id and room id to the socketToRoom
    const usersInThisRoom = users[room.roomID].filter(userData => userData.id !== socket.id);//filter the users ids to send to the client and make peer conction with them 

    socket.emit("all users", usersInThisRoom);
});

socket.on("sending signal", payload => {//reseve 
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
});

socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
});
socket.on("room created", roomData => {
  roomsLinks[roomData.roomID] = roomData;
    io.emit('all rooms links', roomsLinks);
});
socket.on('home page refreshed',()=>{
  io.emit('all rooms links', roomsLinks);
});
socket.on('remove all rooms',()=>{
  console.log(roomsLinks);
  io.emit('destroy all peers');
  io.emit('forced logout')
  roomsLinks={}
  socketToRoom={}
  users={}
})

socket.on('disconnect', () => {
  console.log('user disconnect');
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    
    if (room) {
        room = room.filter(userData => userData.id !== socket.id);
        users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
});
});

app.use("/",loginRouter);
app.use("/",adminRouter);
mongoose.connect(
    `mongodb+srv://asadhm:${process.env.MONGODB_PASSWORD}@cluster0.jdmn4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
      console.log("Connected to DB");
    }
  );

server.listen(process.env.PORT || 4000, () => {
  console.log(`listening of port ${process.env.PORT || 4000}`);
});
