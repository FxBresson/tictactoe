class GameHandler {
  constructor(options) {

    this.id = options.id;

    this.canPlay = false;

    this.render = options.render;
    this.board = new Board(options.dimensions, this.render);


    this.render.renderer.domElement.addEventListener("mouseup", this.onMouseClick.bind(this), false);

  }

  onMouseClick(event) {
      var mouse3D = this.render.getMouse3D(event);
      if(!this.render.isRotatingView){
          var caseClicked = this.board.worldToBoard(mouse3D);
          if (this.canPlay && caseClicked && this.board.pawns[caseClicked[0]][caseClicked[1]] == null) {
            this.play(caseClicked)
          }
      }
  }

  play(cell) {
    socket.emit('g-play',{gameId: this.id, cell: cell});
  }

  placePawn(cell, owner) {
      var pos = this.board.boardToWorld(cell);
      this.board.pawns[cell[0]][cell[1]] = new Pawn ({
          pos: pos,
          owner: owner
      }, this.render)
  }

  endGame() {
    this.clearScene(this.render.scene);
  }

  // https://www.reddit.com/r/threejs/comments/5srlz6/properly_destroy_threejs_instance_object/
  clearScene(scene) {
    for (var i = scene.children.length - 1; i >= 0; i--) {
      var object = scene.children[i];
      if (object.type === 'Mesh') {
        object.geometry.dispose();
        object.material.dispose();
        scene.remove(object);
      }
    }
  }

}