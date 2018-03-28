/**
 * Displays the 3D model of a pawn
 * @constructor
 * @param {object} options - an object containing the owner of the pawn and its position
 * @param {object} render - render reference
 */
class Pawn {
    constructor(options, render) {

        //Group
        var pieceObjGroup = new THREE.Object3D();
        //Pawn Mesh
        var pieceMesh = new THREE.Mesh(render.objects.piece);
        //Pawn material, depending on the owner
        if (options.owner === 1) {
            pieceMesh.material = render.materials.whitePieceMaterial;
        } else {
            pieceMesh.material = render.materials.blackPieceMaterial;
        }
        //Pawn Shadow
        var shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(render.squareSize, render.squareSize, 1, 1), render.materials.pieceShadowPlane);
        shadowPlane.rotation.x = -90 * Math.PI / 180;
        //Add Shadow and Mesh to Group
        pieceObjGroup.add(pieceMesh);
        pieceObjGroup.add(shadowPlane);
        //Set Position
        pieceObjGroup.position.set(options.pos.x, options.pos.y, options.pos.z);
        //Add To scene
        render.scene.add(pieceObjGroup);
    };
}