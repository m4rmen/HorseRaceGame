const Game = require("./game");

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  

// Enable CORS for all routes
app.use(cors());

const games = [];

function getGameById(id) {
  return games.find((game) => game.gameId === id);
}

io.on("connection", (socket) => {

  socket.on("createRoom", (data) => {
    const currentGame = new Game(data);
    currentGame.organizerId = socket.id;
    games.push(currentGame);
    socket.join(currentGame.gameId)
  });


  socket.on("joinRoom", (username, roomId) => {
    const currentGame = getGameById(roomId);
    currentGame.addPlayer(username, socket.id);
    socket.join(roomId);
    socket.to(roomId).emit("updatePlayers", currentGame.players); 
  });

  socket.on("quitGame", (roomId) => {
    const currentGame = getGameById(roomId);
    currentGame.removePlayer(socket.id);
    socket.to(currentGame.organizerId).emit("updatePlayers", currentGame.players); 
  })

  socket.on("getPlayers", (roomId,callback)=>{
    const currentGame = getGameById(roomId);
    callback(currentGame.players);
  })

  socket.on("startBettingPhase", (roomId)=>{
    socket.to(roomId).emit("bettingPhase");
  })

  socket.on("betsPlaced", (bet, roomId)=>{
    const currentGame = getGameById(roomId);
    const currentPlayer = currentGame.players.find((player)=>player.socketId === socket.id);
    currentPlayer.bet = bet;

    socket.to(currentGame.organizerId).emit("updatePlayers", currentGame.players); 

    let count = 0;
    console.log("Current Game players : ", currentGame.players)

    currentGame.players.forEach((player) => {
      if(Object.keys(player.bet).length){
        count +=1;
      }
    });
    if(count === currentGame.players.length){
      console.log("count: ",count)
      io.to(roomId).emit("startGame");
      console.log("start game")
    }
  })

  socket.on("flipCard", (roomId)=>{
    const currentGame = getGameById(roomId);
    const card = currentGame.flipCard();
    setTimeout(() => {
      io.to(roomId).emit("cardFlipped", card);
      io.to(roomId).emit("updateGrid", currentGame.grid);
      if(currentGame.gameWon) {
        io.to(roomId).emit("gameWon", currentGame.winner)
      }
      io.to(roomId).emit("updatePosition", currentGame.positions)
    }, 100);

  })


  socket.on("getPlayerBet", (roomId, callback)=>{
    const currentGame = getGameById(roomId);
    const currentPlayer = currentGame.players.find((player)=>player.socketId === socket.id);
    callback(currentPlayer.bet);
  })




  //TODO complete this
  socket.on("playAgain", (roomId)=>{
    const oldGame = getGameById(roomId);
    const players = oldGame.players;
    console.log("old game players : ", players)
    games.splice(games.indexOf(oldGame), 1);
    const newGame = new Game(roomId);
    games.push(newGame);
    for(let player of players){
      console.log("player : ", player)
      player.resetBet();
    }
    newGame.players = [...players];
    console.log("New Game players : ", newGame.players)
    newGame.organizerId = oldGame.organizerId;
    socket.to(roomId).emit("newGame", newGame.players);
  })


  socket.on("disconnect", () => {
    games.map((game) => {
      if (game.organizerId === socket.id) {
        games.splice(games.indexOf(game), 1);
      }
    });  
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

