import { io } from "socket.io-client";


export const socket =
io("tea-production-a9fb.up.railway.app");


socket.on("connect",()=>{

console.log(
"Connected to TEA socket:",
socket.id
);

});