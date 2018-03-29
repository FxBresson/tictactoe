# Tic-Tac-Toe

This project was made using node.js and socket.io on the server side, and javascript/jquery for the client. Graphics are rendered using Three.js

The assets and some functions were taken from http://www.osd.net/blog/web-development/3d-board-game-in-a-browser-using-webgl-and-three-js-part-1/. Thanks [CAM](http://www.osd.net/blog/author/adrian/) for this awesome tutorial ! 

# Startup

Install the required modules with `$ npm install`
Launch the server with `$ node server.js`

# Progression :

- Things done : 
	--
	- Server side game logic 
	- Client Side render using classes
	- Matchmaking system
		- Automatically find players and start a game
		- Handle end of games and disconnects
	- 3D rendering and interactions
	- End of game conditions 
	- Working with different sizes (configurable server side)

- Things to do :
	-- 
	- User accounts
	- Improve matchmaking system
	- Improve Graphics :
		- Import own 3D models and 2D textures
		- Improve lightning
	- Fix Three.js console warnings
	- Limit Camera movement with OrbitControl
	- Allow user to change dimensions
	- Local games
	- Create and join rooms
	- AI

# Project architecture :

Files used by the server :
- `server.js` : Express and Socket.io
- `assets/js/class/Game.js` : main class that handle all the game logic server side

Files used by the clients :
- `index.html` : Main HTML page
- `assets/js/main.js` : Main logic that constructs the renderer and hadle all of the socket.io interactions
- `assets/js/class/GameHandler.js` : handle the events and some of the logic required client side
- `assets/js/class/render.js` : handle all the rendering logic
- `assets/js/class/Pawn.js AND assets/js/class/Board.js` : handle the creation and rendering of 3D objects in the scene