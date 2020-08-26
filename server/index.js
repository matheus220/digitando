require("dotenv/config");
const express = require("express");
const socket = require("socket.io");

const db = require("./db");
var message = require("./routes/message");
var upload = require("./routes/upload");

// App setup
const app = express();
const server = app.listen(process.env.SERVER_PORT, function () {
  console.log(`Listening on port ${process.env.SERVER_PORT}`);
  console.log(`http://localhost:${process.env.SERVER_PORT}`);
});

// Routes
app.use("/message", message);
app.use("/upload", upload);

// Static files
app.use(express.static("public"));

// Socket setup
const io = socket(server);

const activeUsers = new Set();

io.on("connection", function (socket) {
  socket.on("new user", function (data) {
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
  });

  socket.on("chat message", function (data) {
    db.saveMessage(data);
    io.emit("chat message", data);
  });

  socket.on("typing", function (data) {
    socket.broadcast.emit("typing", data);
  });
});
