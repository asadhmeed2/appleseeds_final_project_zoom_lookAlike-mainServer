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
let socketToRoom = {};// save users id and witch room thear in
let usersLogedInUuid={}  

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join room", userData => {
    // let user ={id:userData.uniqid,roomID:userData.roomID}
    // socket.join(user.roomID);
    // if(usersLogedInUuid[userData.uniqid]){
    //   socket.emit('user already joined');
    // }
    socket.join(userData.roomID);
    usersLogedInUuid[userData.uniqid]=userData.uniqid;
    if (users[userData.roomID]) {//if there is some one connected to the room 
        //  user = users[room.roomID].find(user => user.uniqid === room.uniqid)
        // console.log(user);
        // if(!user){
          users[userData.roomID].push(socket.id); // add the new user socket id to the room  
        // }else{
        //   socket.emit("already in the room");
        // }
    } else {
        users[userData.roomID] = [socket.id];//initialize the room weth the first user socket id 
    }
    // if(!user){
      socketToRoom[socket.id] = userData.roomID; //add the user id and room id to the socketToRoom
      const usersInThisRoom = users[userData.roomID].filter(id => id !== socket.id);//filter the users ids to send to the client and make peer conction with them 
      console.log('usersInThisRoom',usersInThisRoom);
      socket.emit("all users", usersInThisRoom);
    // }
});


socket.on("sending signal", payload => {//reseve 
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
});


socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
});


socket.on('disconnect', () => {
  console.log('user disconnect');
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    if (room) {
        room = room.filter(id => id !== socket.id);
        users[roomID] = [...room];
    }
    socket.broadcast.emit("user left", socket.id);
});

socket.on('change', (payload) => {
  socket.broadcast.emit('change',payload)
});
socket.on("logout all",()=>{
  socket.broadcast.emit('logout')
})

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
