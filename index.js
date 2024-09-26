
const express = require("express");
const app = express();
const https = require("http");
const {Server} = require("socket.io");
const cors = require("cors")
const fs = require("fs")
//const https = require("https")

app.use(cors({
    origin: "https://timer.deltanoise.net",
    methods: ["GET", "POST"],
}));

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/server.deltanoise.net/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/server.deltanoise.net/cert.pem")
}

const server = https.createServer(options, app);

let baseTime = 600;
let serverTime = 1000;
let timeRunning = true;
let yellow_limit = 5;
let red_limit = 1;

const io = new Server(server, {
    cors: {
        origin: "https://timer.deltanoise.net",
        methods: ["GET", "POST"],
        transports : ["websocket","polling"],
        credentials: true
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

    socket.on("set_red_limit", (limit) => {
        red_limit += limit;
        io.emit("receive_red_limit", red_limit);

    })

    socket.on("set_yellow_limit", (limit) => {
        yellow_limit += limit;
        io.emit("receive_yellow_limit", yellow_limit);

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