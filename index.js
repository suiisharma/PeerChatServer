const express = require('express');
const dotenv=require("dotenv");
const cors=require("cors");
const socketIo=require("socket.io");
const http=require("http");
const {v4 : uuidv4}=require("uuid");

dotenv.config();

// Create express app
const app = express();
const server=http.createServer(app);
const io=socketIo(server,{
    cors:{
        origin: "*",
        methods: ["GET","POST"]
    }
});


// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended:true}));


const port=process.env.PORT || 5000;

app.get('/create-room-id',(req,res)=>{
let id=uuidv4();
res.status(200).json({
    id:id
});
});


io.on("connection",(socket)=>{

    socket.on("join-room",(roomId)=>{
        socket.join(roomId);
    });

    socket.on("message",(roomJoinId,message)=>{
        socket.to(roomJoinId).emit("message",message);
    });
    socket.on("chat-message",(roomJoinId,message)=>{
        socket.to(roomJoinId).emit('chat-message',message);
    })
    socket.on("file",(data)=>{
        socket.to(data.roomJoinId).emit("file",data);
    });

    socket.on("hangup",(roomJoinId)=>{
        socket.to(roomJoinId).emit("hangup");
    });
});

const errorHandler=(err,req,res,next)=>{
    console.log('Error:',err);
}
app.use(errorHandler);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`)
});