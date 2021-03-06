/**
 * Handle all the render logic
 * @constructor
 * @param {object} options - an object containing the DOM container of the canvas and the URL of the assets
 * @param {function} renderCallback - to make sure all the logic will be executed after the render has loaded
 */
class Render {
    constructor(options, renderCallback) {
        //Resources
        this.lights = {};
        this.materials = {};
        this.objects = {}

        //Object
        this.cameraController;
        this.projector = new THREE.Projector();

        //Models
        this.boardModel;
        this.groundModel;

        //Variables
        this.squareSize = 10;
        var viewWidth = options.containerEl.offsetWidth;
        var viewHeight = options.containerEl.offsetHeight;

        this.assetsUrl = options.assetsUrl;
        this.isRotatingView = false;
        
        //Instantiate the WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(viewWidth, viewHeight);

        //Create the scene
        this.scene = new THREE.Scene();

        //Create camera
        this.camera = new THREE.PerspectiveCamera(35, viewWidth / viewHeight, 1, 1000);
        this.cameraController = new THREE.OrbitControls(this.camera, options.containerEl);
        this.centerCamera([1.5, 1.5]);
        this.scene.add(this.camera);   

        //Init elements
        this.initMaterials();
        this.initLights();
        this.initListeners()
        this.initObjects(function () {
            //Add the Renderer to the page
            options.containerEl.appendChild(this.renderer.domElement);
            renderCallback();
            //Start animation
            this.onAnimationFrame();
        }.bind(this));

        
    }
    /**
     * Center the camera
     * @param  {array} center - The position (in cells) of the center of the board
     */
    centerCamera(center) {
        this.camera.position.set(this.squareSize * center[0], 120, 150)
        this.cameraController.center.set(this.squareSize * center[0], 0, this.squareSize * center[0]);
    }

    /**
     * Initialize the mouse events that will allow to rotate the view
     */
    initListeners() {
        this.renderer.domElement.addEventListener("mousedown", function(){
            this.isRotatingView = false;
        }.bind(this), false);
        this.renderer.domElement.addEventListener("mousemove", function(){
            this.isRotatingView = true;
        }.bind(this), false);
    }

    /**
     * Get the emulated position of the mouse in the 3D space
     * @param  {object} mouseEvent - Mouse information
     * @return {object} - The relative position of the mouse pointer in the 3D space
     * @memberof Render
     */
    getMouse3D(mouseEvent) {
        var x, y;
        if (mouseEvent.offsetX !== undefined) {
            x = mouseEvent.offsetX;
            y = mouseEvent.offsetY;
        } else {
            x = mouseEvent.layerX;
            y = mouseEvent.layerY;
        }
        var pos = new THREE.Vector3(0, 0, 0);
        var pMouse = new THREE.Vector3(
            (x / this.renderer.domElement.width) * 2 - 1,
           -(y / this.renderer.domElement.height) * 2 + 1,
           1
        );
        this.projector.unprojectVector(pMouse, this.camera);
        var cam = this.camera.position;
        var m = pMouse.y / ( pMouse.y - cam.y );
    
        pos.x = pMouse.x + ( cam.x - pMouse.x ) * m;
        pos.z = pMouse.z + ( cam.z - pMouse.z ) * m;
        return pos;
    }

    /**
     * Load the 3D objects
     * @param  {function} callback - function to execute after loading is finished 
     */
    initObjects(callback) {
        var _self = this;
        var loader = new THREE.JSONLoader();
        var totalObjectsToLoad = 2; // board + the piece
        var loadedObjects = 0; // count the loaded objects
    
        // checks if all the objects have been loaded
        function checkLoad() {
            loadedObjects++;
            if (loadedObjects === totalObjectsToLoad && callback) { callback(); }
        }

        // load board
        loader.load(this.assetsUrl + 'board.js', function (geometry) {
            _self.objects.board = geometry
            checkLoad();
        });

        // load piece
        loader.load(this.assetsUrl + 'piece.js', function (geometry) {
            _self.objects.piece = geometry;
            checkLoad();
        });
        //this.scene.add(new THREE.AxisHelper(100));
    }

    /**
     * Load the 2D materials
     */
    initMaterials() {
        // board material
        this.materials.boardMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(this.assetsUrl + 'board_texture.jpg')
        });

        // ground material
        this.materials.groundMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture(this.assetsUrl + 'ground.png')
        });

        // dark square material
        this.materials.darkSquareMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(this.assetsUrl + 'square_dark_texture.jpg')
        });
        //
        // light square material
        this.materials.lightSquareMaterial = new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture(this.assetsUrl + 'square_light_texture.jpg')
        });

        // white piece material
        this.materials.whitePieceMaterial = new THREE.MeshPhongMaterial({
            color: 0xe9e4bd,
            shininess: 20
        });

        // black piece material
        this.materials.blackPieceMaterial = new THREE.MeshPhongMaterial({
            color: 0x9f2200,
            shininess: 20
        });

        // pieces shadow plane material
        this.materials.pieceShadowPlane = new THREE.MeshBasicMaterial({
            transparent: true,
            map: THREE.ImageUtils.loadTexture(this.assetsUrl + 'piece_shadow.png')
        });
    }

    /**
     * Initialize the lights
     */
    initLights() {
        // top light
        this.lights.topLight = new THREE.PointLight();
        this.lights.topLight.position.set(this.squareSize * 4, 150, this.squareSize * 4);
        this.lights.topLight.intensity = 1.0;
        // add the lights in the scene
        this.scene.add(this.lights.topLight);
    }

    /**
     * Main animation function
     */
    onAnimationFrame() {
        requestAnimationFrame(this.onAnimationFrame.bind(this));
        this.cameraController.update();
        this.renderer.render(this.scene, this.camera);
    }
}