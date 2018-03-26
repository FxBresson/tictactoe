var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
const Game = require('./assets/js/class/Game.js');


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});
app.use(express.static('assets'));


var gameCollection = {};
var players = {};

io.on('connection', function (socket) {
	console.log('a user connected');
	players[socket.id] = socket;



	socket.on('mm-search', function () {

		var gameFound = false;

		for (var id in gameCollection) {
			var game = gameCollection[id]
			if (game.isOpened()) {
				//join game
				gameFound = true;
				game.players[game.players.length == 1 ? 1 : 0] = socket.id;
				players[game.players[0]].join(game.id);
				players[game.players[1]].join(game.id);
				game.startGame();
			}
		};

		if (!gameFound) {
			var gameId = generateGameId();
			gameCollection[gameId] = new Game(io, {
				gameId: gameId,
				player1: socket.id,
				dimensions: [3, 3]
			});
		}
	})


	socket.on('g-play', function(play) {
		var opt = {cell: play.cell, owner: gameCollection[play.gameId].currentPlayer}
		var game = gameCollection[play.gameId]
		game.play(opt.cell);
		io.to(game.id).emit('g-placePawn', opt);
	})

});


http.listen(3000, function () {
	console.log('listening on *:3000');
});


function generateGameId() {
	return (Math.random() + 1).toString(36).slice(2, 18);
}


