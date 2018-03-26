class Pawn {
    constructor(options, render) {
        this.owner = options.owner

        var pieceMesh = new THREE.Mesh(render.objects.piece);
        var pieceObjGroup = new THREE.Object3D();

        if (this.owner === 1) {
            pieceMesh.material = render.materials.whitePieceMaterial;
        } else {
            pieceMesh.material = render.materials.blackPieceMaterial;
        }

        // create shadow plane
        var shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(render.squareSize, render.squareSize, 1, 1), render.materials.pieceShadowPlane);
        shadowPlane.rotation.x = -90 * Math.PI / 180;

        pieceObjGroup.add(pieceMesh);
        pieceObjGroup.add(shadowPlane);

        pieceObjGroup.position.set(options.pos.x, options.pos.y, options.pos.z);

        render.scene.add(pieceObjGroup);
    };
}