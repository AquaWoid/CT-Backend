
const express = require("express");
const app = express();
const http = require("http");
const {Server} = require("socket.io");
const cors = require("cors")


app.use(cors());

const server = http.createServer(app);

let baseTime = 600;
let serverTime = 1000;
let timeRunning = true;

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["Get", "POST"]
    }
});

io.on("connection", (socket) => {

    console.log(`User Connected: ${socket.id}`);

    socket.on("set_server_time", (inputTime) => {
        serverTime += inputTime;
        socket.emit("receive_server_time", serverTime);
    })

    socket.on("request_server_time", () => {
        console.log(serverTime)
        socket.emit("receive_server_time", serverTime);
    })

    socket.on("send_message", (data) => {
        socket.broadcast.emit("receive_message", data);
        console.log(data);
    });

    socket.on("toggle_active_status", (condition) => {
        timeRunning = condition;
    })

    socket.on("reset_timer", () => {
        serverTime = baseTime;
        socket.emit("receive_server_time", serverTime);
    })
})

server.listen(3001, () => {
    console.log("Server Running");
});


setInterval(timerLogic, 1000);
  
//Timer Calculations
async function timerLogic(){

  if(timeRunning)
  serverTime--;

  if(serverTime <= 0) {
    timeRunning = false;
  }

  console.log(serverTime)

}