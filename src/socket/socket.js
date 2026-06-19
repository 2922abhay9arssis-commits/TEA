import { io } from "socket.io-client";


export const socket =
io("https://tea-server-v1l5.onrender.com");


socket.on("connect",()=>{

console.log(
"Connected to TEA socket:",
socket.id
);

});