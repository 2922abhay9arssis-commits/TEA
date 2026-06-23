const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
let onlineUsers = {};


const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://tea-nine-flax.vercel.app"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));


const server = http.createServer(app);


const io = new Server(server, {

    cors:{
    origin:["http://localhost:5173","https://tea-nine-flax.vercel.app/"],
    methods:["GET","POST"]
}

});


io.on(
"connection",

(socket)=>{

    socket.on(
"typing",

(data)=>{


socket
.to(data.room)
.emit(
"user-typing",
data
);


}

);

    socket.on(
"user-online",
(uid)=>{


onlineUsers[uid]=socket.id;


io.emit(
"online-users",
Object.keys(onlineUsers)
);


}
);


console.log(
"User connected:",
socket.id
);



// join private chat room

socket.on(
"join-room",

(room)=>{


socket.join(room);


console.log(
"Joined room:",
room
);


}

);



// private message

socket.on(
"send-message",

(data)=>{


io
.to(data.room)
.emit(
"receive-message",
data
);


}

);



socket.on(
"disconnect",
()=>{


console.log(
"User disconnected"
);


}

);



}
);



const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{

    console.log(
        `TEA server running on port ${PORT} ☕`
    );

});