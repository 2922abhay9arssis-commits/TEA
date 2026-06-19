import { io } from "socket.io-client";


export const socket =
io("http://localhost:3000");


socket.on("connect",()=>{

console.log(
"Connected to TEA socket:",
socket.id
);

});