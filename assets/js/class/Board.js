class Board {
    constructor(dimensions, render) {

        this.squareSize = render.squareSize
        this.nbRows = dimensions[1];
        this.nbColumns = dimensions[0];
        this.diagSize = Math.min(this.nbRows, this.nbColumns);
        this.size = this.nbColumns * this.nbRows;
        this.pawns = [];

        for (var row = 0; row < this.nbRows; row++) {
            this.pawns[row] = [];
            for (var col = 0; col < this.nbColumns; col++) {
                this.pawns[row][col] = null;
            }
        }

        var squareMaterial;
        for (var row = 0; row < this.nbRows; row++) {
            for (var col = 0; col < this.nbColumns; col++) {
                if ((row + col) % 2 === 0) { // light square
                    squareMaterial = render.materials.lightSquareMaterial;
                } else { // dark square
                    squareMaterial = render.materials.darkSquareMaterial;
                }

                var square = new THREE.Mesh(new THREE.PlaneGeometry(this.squareSize, this.squareSize, 1, 1), squareMaterial);
                square.position.x = col * this.squareSize + this.squareSize / 2;
                square.position.z = row * this.squareSize + this.squareSize / 2;
                square.position.y = -0.01;
                square.rotation.x = -90 * Math.PI / 180;

                render.scene.add(square);
            }
        }

        render.boardModel = new THREE.Mesh(render.objects.board, render.materials.boardMaterial);
        render.boardModel.position.y = -0.02;

        // add ground
        render.groundModel = new THREE.Mesh(new THREE.PlaneGeometry(100, 100, 1, 1), render.materials.groundMaterial);
        render.groundModel.position.set(this.squareSize * 4, -1.52, this.squareSize * 4);
        render.groundModel.rotation.x = -90 * Math.PI / 180;
        render.scene.add(render.groundModel);
    }

    worldToBoard(pos) {
        var i = this.nbRows - Math.ceil((this.squareSize * this.nbRows - pos.z) / this.squareSize);
        var j = Math.ceil(pos.x / this.squareSize) - 1;
    
        if (i >= this.nbRows || i < 0 || j >= this.nbColumns || j < 0 || isNaN(i) || isNaN(j)) {
            return false;
        }
    
        return [i, j];
    }

    boardToWorld (pos) {
        var x = (1 + pos[1]) * this.squareSize - this.squareSize / 2;
        var z = (1 + pos[0]) * this.squareSize - this.squareSize / 2;
    
        return new THREE.Vector3(x, 0, z);
    }
    
    

}