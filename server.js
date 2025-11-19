const { Server } = require("socket.io");
const express = require("express");
const http = require("http");
const cors = require("cors");

const app = express();
app.use(cors());
app.get("/", (req, res) => {
  res.send("Multiplayer server running.");
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Store player data keyed by socket.id
const players = {};

io.on("connection", (socket) => {
  console.log("✅ Player connected:", socket.id);

  // Listen for join event with player name
  socket.on("join", (data) => {
    console.log("👤 Player joined:", socket.id, "Name:", data.name);
    
    // Add the new player with initial position and name
    players[socket.id] = {
      position: data.position || { x: 0, y: 0, z: 0 },
      rotation: 0,
      name: data.name || "Player",
    };

    // Send the new player the list of existing players
    socket.emit("existingPlayers", players);

    // Notify others that a new player joined
    socket.broadcast.emit("newPlayer", { 
      id: socket.id, 
      position: players[socket.id].position,
      name: players[socket.id].name
    });

    // Also emit spawn event for compatibility
    socket.broadcast.emit("spawn", { 
      id: socket.id, 
      position: players[socket.id].position,
      name: players[socket.id].name
    });
  });

  socket.on("updatePosition", (data) => {
    if (players[socket.id]) {
      players[socket.id].position = data.position;
      players[socket.id].rotation = data.rotation;
      players[socket.id].gunState = data.gunState;

      socket.broadcast.emit("playerMoved", {
        id: socket.id,
        position: data.position,
        rotation: data.rotation,
        gunState: data.gunState,
      });
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("❌ Player disconnected:", socket.id);
    delete players[socket.id];
    socket.broadcast.emit("playerDisconnected", socket.id);
  });
});

// Use Render's dynamic port (important for deployment)
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
