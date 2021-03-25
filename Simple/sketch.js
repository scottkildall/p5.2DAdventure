/***********************************************************************************
  Simple
  by Scott Kildall

  Uses the p5.2DAdventure.js class 

  To do:
  ** cleanup p5.2DAdventure.js class + document it
  ** add support for sprite movement
  ** add mouse events, other interactions
  ** finish MazeMapper
  
------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/

// Make global 
var adventureManager;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
  adventureManager = new AdventureManager("data/adventureStates.csv", "data/interactionTable.csv");
}

// Setup the adventure manager
function setup() {
  createCanvas(1280, 720);

  // This will load the images, go through state and interation tables, etc
  adventureManager.setup();
}

// Adventure manager handles it all!
function draw() {
  adventureManager.draw();
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
  adventureManager.keyPressed(key);
}

//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//
