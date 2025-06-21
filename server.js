const { Server } = require("socket.io");
const http = require("http");

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*", // allow all origins for now
  },
});

const players = {};

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  players[socket.id] = {
    x: 0,
    y: 0,
    z: 0,
    name: "Player",
  };

  socket.emit("init", { id: socket.id, players });
  socket.broadcast.emit("playerJoined", {
    id: socket.id,
    data: players[socket.id],
  });

  socket.on("updatePosition", (pos) => {
    if (players[socket.id]) {
      players[socket.id] = { ...players[socket.id], ...pos };
      socket.broadcast.emit("updatePlayer", { id: socket.id, pos });
    }
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("playerLeft", { id: socket.id });
  });
});

server.listen(3000, () => {
  console.log("🟢 Multiplayer server running on port 3000");
});
