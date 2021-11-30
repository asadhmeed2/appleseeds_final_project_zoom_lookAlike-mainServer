const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server);
const users = {};//save users  ids that connected to particular room with room id key

const socketToRoom = {};// save users id and witch room thear in  
io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("join room", roomID => {
    if (users[roomID]) {//if there is some one connected to the room 
        users[roomID].push(socket.id); // add the new user id to the room 
    } else {
        users[roomID] = [socket.id];//initialize the room weth the first user id 
    }
    socketToRoom[socket.id] = roomID; //add the user id and room id to the socketToRoom
    const usersInThisRoom = users[roomID].filter(id => id !== socket.id);//filter the users ids to send to the client and make peer conction with them 

    socket.emit("all users", usersInThisRoom);
});

socket.on("sending signal", payload => {//reseve 
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
});

socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
});

socket.on('disconnect', () => {
    const roomID = socketToRoom[socket.id];
    let room = users[roomID];
    
    if (room) {
        room = room.filter(id => id !== socket.id);
        users[roomID] = room;
    }
    socket.broadcast.emit("user left", socket.id);
    console.log(room);
});
});



server.listen(process.env.PORT || 4000, () => {
  console.log(`listening of port ${process.env.PORT || 4000}`);
});
