class Game {
    constructor(io, options) {

        this.io = io;

        this.currentPlayer = null;

        this.players = []
        this.players[Math.round(Math.random())] = options.player1;

        this.id = options.gameId;
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

    startGame() {
        this.io.to(this.id).emit('mm-gameFound', {gameId: this.id, dimensions: [this.board.nbColumns, this.board.nbRows]});
        this.currentPlayer = Math.round(Math.random());
        this.io.to(this.id).emit('g-startTurn', this.players[this.currentPlayer])
    }

    play(cell) {
        this.board.pawns[cell[0]][cell[1]] = this.currentPlayer
        if (!this.verif(cell)) {
            if (this.board.pawns.join().indexOf(',,') == -1) {
                //BoardFull
                this.endGame(false)
            } else {
                this.switchUser();
            }
        } else {
            this.endGame(this.players[this.currentPlayer]);
        }
    }

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

    switchUser() {
        this.currentPlayer = this.currentPlayer == 1 ? 0 : 1;
        this.io.to(this.id).emit('g-startTurn', this.players[this.currentPlayer]);
    }

    endGame(winner) {
        this.io.to(this.id).emit('g-end', winner);
    }

    isOpened() {
        return this.players.length == 1 || this.players[0] == undefined;
    }
}

module.exports = Game;