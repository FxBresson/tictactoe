/**
 * Handle all the event and render logic for a game
 * @constructor
 * @param {object} options - an object containing the id of the game and the board created by the server
 * @param {object} render - render reference
 */
class GameHandler {
    constructor(options, render) {
        this.id = options.id;
        this.render = render;

        this.canPlay = false;
        //Create a new board
        this.board = new Board(options.board, this.render);
        //Add Event Listner
        this.render.renderer.domElement.addEventListener("mouseup", this.onMouseClick.bind(this), false);
    }

    /**
     * 
     * @param  {any} event 
     */
    onMouseClick(event) {
        var mouse3D = this.render.getMouse3D(event);
        //If not rotating view...
        if (!this.render.isRotatingView) {
            var caseClicked = this.board.worldToBoard(mouse3D);
            //And if : it's the player's turn, the cell clicked exists and is not occupied...
            if (this.canPlay && caseClicked && this.board.pawns[caseClicked[0]][caseClicked[1]] == null) {
                //then, play
                this.play(caseClicked)
            }
        }
    }

    /**
     * Play a pawn
     * @param  {array} cell - Position of the cell in the board
     */
    play(cell) {
        socket.emit('g-play', {
            gameId: this.id,
            cell: cell
        });
    }

    /**
     * Place a pawn on the scene
     * @param  {any} cell - The cell in which to place a pawn
     */
    placePawn(cell, owner) {
        var pos = this.board.boardToWorld(cell);
        this.board.pawns[cell[0]][cell[1]] = new Pawn({
            pos: pos,
            owner: owner
        }, this.render)
    }

    /**
     * End the game
     */
    endGame() {
        //Delete all objects in the scene
        this.clearScene(this.render.scene);
    }

    // https://www.reddit.com/r/threejs/comments/5srlz6/properly_destroy_threejs_instance_object/
    /**
     * Clean a scene by deleting all of its Mesh and group of mesh
     * @param  {object} scene - The scene to clean 
     */
    clearScene(scene) {
        for (var i = scene.children.length - 1; i >= 0; i--) {
            var object = scene.children[i];
            if (object.type === 'Mesh') {
                object.geometry.dispose();
                object.material.dispose();
                scene.remove(object);
            } else if (object.type === 'Object3D') {
                this.clearScene(object)
                scene.remove(object);
            }
        }
    }

}