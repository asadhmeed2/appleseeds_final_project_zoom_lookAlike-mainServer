const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server);




io.on('connection',(socket) => {
    console.log('a user connected');
    socket.on("new-stream",(stream)=>{
        io.emit('start-stream',stream)
    })
})





server.listen(process.env.PORT|| 4000,()=>{
    console.log(`listening of port ${process.env.PORT||4000}`);
});