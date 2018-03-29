var socket = io();
var gameHandler = null;

//Main render object
var render = new Render({
	containerEl: document.getElementById('boardContainer'),
	assetsUrl: '3d/',
}, function () {
	//Initiale the UI
	state('menu')
	//Search a game
	$('.btn-findGame').click(function () {
		state('searching');
		socket.emit('mm-search');
	})
	//At the end of a game, reset the scne
	$('.btn-restart').click(function () {
		socket.emit('g-leave', gameHandler.id);
		gameHandler.endGame();
		state('searching');
		socket.emit('mm-search');
	})
	//When a game is found
	socket.on('mm-gameFound', function (options) {
		state('inGame');
		//Construct a new gamehandler with the id of the game and the dimensions of the board
		gameHandler = new GameHandler(options, render);
		//When a pawn is placed
		socket.on('g-placePawn', function (opt) {
			gameHandler.placePawn(opt.cell, opt.owner);
		})
		//When the turn switches
		socket.on('g-startTurn', function (player) {
			if (player == socket.id) {
				state('yourturn');
				gameHandler.canPlay = true;
			} else {
				state('opponentturn');
				gameHandler.canPlay = false;
			}
		})
		//When the game ends
		socket.on('g-end', function (winner) {
			gameHandler.canPlay = false;
			if (!winner) { //Tie
				state('end tie')
			} else if (winner == socket.id) { //Win
				state('end win')
			} else { //Lose
				state('end lose')
			}
		})
	})
})

/**
 * Add/Remove classes on the body to handle ui animations
 * @param  {string} state 
 * @return {void}
 */
function state(state) {
	$('body').removeClass().addClass(state)
}