/**
 * Handle all the game logic
 * @constructor
 * @param {object} io - socket.io reference
 * @param {object} options - an object containing the game id, the 1st player id and the dimensions of the board
 */
class Game {
    constructor(io, options) {
        this.io = io;
        this.id = options.gameId;
        this.currentPlayer = null;

        this.finished = false;

        //array that contains the players
        this.players = []
        //assign a random player number (1 or 2) number to the player
        this.players[Math.round(Math.random())] = options.player1;

        //Configure the board with the dimensions wanted
        //this.board.pawn will represent the state of the board
        this.board = {
            nbRows: options.dimensions[1],
            nbColumns: options.dimensions[0],
            pawns: []
        }
        this.board.diagSize = Math.min(this.board.nbRows, this.board.nbColumns);
        this.board.size = this.board.nbColumns * this.board.nbRows;
        for (var row = 0; row < this.board.nbRows; row++) {
            this.board.pawns[row] = [];
            for (var col = 0; col < this.board.nbColumns; col++) {
                this.board.pawns[row][col] = null;
            }
        }
    }

    /**
     * Starts the game, emit the gameFound event and the first startTurn event
     */
    startGame() {
        this.io.to(this.id).emit('mm-gameFound', {id: this.id, board: this.board});
        this.currentPlayer = Math.round(Math.random());
        this.io.to(this.id).emit('g-startTurn', this.players[this.currentPlayer])
    }

    /**
     * Main function called when a player plays a pawn
     * @param  {any} cell 
     */
    play(cell) {
        //Add the pawn to the board
        this.board.pawns[cell[0]][cell[1]] = this.currentPlayer
        if (!this.verif(cell)) { //If the pawn placed doesn't win
            if (this.board.pawns.join().indexOf(',,') == -1) { //End game if the board is full
                this.endGame(false)
            } else {
                this.switchUser();
            }
        } else { //If win
            this.endGame(this.players[this.currentPlayer]);
        }
    }

    /**
     * Check if the pawn placed allow his owner to win
     * @param  {array} cell The cell in which the pawn was placed
     * @return {bool} if win or not
     */
    verif(cell) {
        return this.checkCol(cell[1]) || this.checkRow(cell[0]) || this.checkDiagL(cell[0], cell[1]) || this.checkDiagR(cell[0], cell[1]);
    }

    checkRow(rowToCheck) {
        var win = true;
        for (var colToCheck = 0; colToCheck < this.board.nbColumns; colToCheck++) {
            var pawn = this.board.pawns[rowToCheck][colToCheck];
            if (pawn == null || pawn != this.currentPlayer) {
                win = false
            }
        }
        return win;
    }

    checkCol(colToCheck) {
        var win = true;
        for (var rowToCheck = 0; rowToCheck < this.board.nbRows; rowToCheck++) {
            var pawn = this.board.pawns[rowToCheck][colToCheck];
            if (pawn == null || pawn != this.currentPlayer) {
                win = false
            }
        }
        return win
    }

    checkDiagR(row, col) {
        var win = true;
        var start = [];
        var i = 0
        if (row == Math.min(row, col)) {
            start = [0, col - row]
        } else {
            start = [row - col, 0];
        }
        for (var rowToCheck = start[0], colToCheck = start[1], i; rowToCheck < this.board.nbRows && colToCheck < this.board.nbColumns; rowToCheck++, colToCheck++, ++i) {
            var pawn = this.board.pawns[rowToCheck][colToCheck];
            if (pawn == null || pawn != this.currentPlayer) {
                win = false
            }
        }
        if (i < this.board.diagSize) {
            win = false
        }
        return win;
    }

    checkDiagL(row, col) {
        var win = true;
        var start = [];
        var i = 0;
        if (row == Math.min(row, this.board.nbColumns - 1 - col)) {
            start = [0, col + row];
        } else {
            start = [row - (this.board.nbColumns - 1 - col), this.board.nbColumns - 1]
        }
        for (var rowToCheck = start[0], colToCheck = start[1], i; rowToCheck < this.board.nbRows && colToCheck < this.board.nbColumns; rowToCheck++, colToCheck--, ++i) {
            var pawn = this.board.pawns[rowToCheck][colToCheck];
            if (pawn == null || pawn != this.currentPlayer) {
                win = false
            }
        }
        if (i < this.board.diagSize) {
            win = false
        }
        return win;
    }

    /**
     * Switch user and emit the startTurn event
     */
    switchUser() {
        this.currentPlayer = this.currentPlayer == 1 ? 0 : 1;
        this.io.to(this.id).emit('g-startTurn', this.players[this.currentPlayer]);
    }

    /**
     * Emit the end game event with the winner
     * @param {int} winner The socket id of the winner
     */
    endGame(winner) {
        this.finished = true;
        this.io.to(this.id).emit('g-end', winner);
    }
    /**
     * Return if the game has only 1 player
     * @return {bool} true if game is opened, false if else
     */
    isOpened() {
        return !this.finished && (this.players.length == 1 || this.players[0] == undefined);
    }
}

module.exports = Game;