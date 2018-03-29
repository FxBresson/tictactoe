/* ========== Function ========== */
/**
 * Generate a random id
 * @return {string} A random id
 */
function generateGameId() {
    return (Math.random() + 1).toString(36).slice(2, 18);
}

function destroyGame(id) {
    delete gameCollection[id];
}

/* ========== Variables ========== */
// Server
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const Game = require('./assets/js/class/Game.js');

// Logic
let gameCollection = {};
let players = {};

/* ========== Routes ========== */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.use(express.static('assets'));

/* ========== Web Socket Handlers ========== */
io.on('connection', function (socket) {
    //Add socket to list of players
    players[socket.id] = socket;

    //Event - when a socket searches for a game
    socket.on('mm-search', function () {
        let gameFound = false;

        //Try to find a game for {socket}
        for (let id in gameCollection) {
            let game = gameCollection[id];
            if (game.isOpened()) {
                //Join existing game
                gameFound = true;
                //Assign player number
                game.players[game.players.length == 1 ? 1 : 0] = socket.id;
                //Join Socket.io Room {game.id}
                players[game.players[0]].join(game.id);
                players[game.players[1]].join(game.id);
                game.startGame();
            }
        };

        //If no game found, create a new game
        if (!gameFound) {
            let gameId = generateGameId();
            gameCollection[gameId] = new Game(io, {
                gameId: gameId,
                player1: socket.id,
                dimensions: [3, 3]
            });
        }
    })

    //Event - when a socket plays a pawn
    socket.on('g-play', function (play) {
        let game = gameCollection[play.gameId]
        let opt = {
            cell: play.cell,
            owner: game.currentPlayer
        }
        game.play(opt.cell);
        //Event - tell the the sockets to place the pawn of the board
        io.to(game.id).emit('g-placePawn', opt);
    })

    socket.on('disconnect', function() {
        delete players[socket.id];
        for (let gameId in gameCollection) {
            let game = gameCollection[gameId]
            let indexOf = game.players.indexOf(socket.id)
            if (indexOf > -1) {
                game.players.splice(indexOf, 1);
                socket.leave(game.id)
                let winner = indexOf == 0 ? 1 : 0;
                game.endGame(game.players[winner]);
            }
        }
    })

    socket.on('g-leave', function(gameId){
        socket.leave(gameId);
        let game = gameCollection[gameId];
        let indexOf = game.players.indexOf(socket.id)
        game.players.splice(indexOf, 1);
        socket.leave(gameId)
        if (game.players.length == 0) { //game is finished, all players have left
            delete gameCollection[gameId];
        }
    })

});

/* ========== Launch Server ========== */
http.listen(3000, function () {
    console.log('Starting server');
});