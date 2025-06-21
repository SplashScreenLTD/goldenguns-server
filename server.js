const { Server } = require("socket.io");

const io = new Server({
  cors: { origin: "*" },
});

const players = {};

io.on("connection", (socket) => {
  console.log("New connection:", socket.id);

  // Initialize new player
  players[socket.id] = {
    position: { x: 0, y: 0, z: 0 },
    rotation: 0,
    name: `Player`,
    gun: "ppk",
    isCrouching: false,
    isShooting: false,
  };

  // Send existing players to new player
  socket.emit("existingPlayers", players);

  // Notify others of new player
  socket.broadcast.emit("newPlayer", { id: socket.id, ...players[socket.id] });

  socket.on("updateState", (state) => {
    players[socket.id] = { ...players[socket.id], ...state };
    socket.broadcast.emit("playerMoved", { id: socket.id, ...state });
  });

  socket.on("disconnect", () => {
    console.log("Player disconnected:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("playerLeft", socket.id);
  });
});

io.listen(3000);
