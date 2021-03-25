/***********************************************************************************
  Simple
  by Scott Kildall

  Uses the p5.stateMachine.js class

  Class allocation by class name works

  Figure out the next steps:
  (1) use a .csv file as an initializer? -- state name, background image, other data? --
  (2) how to subclass our own states from these?
  (3) how to move sprites into the state machine architecture?
  (4) could we create a grad "maze" this way with separate rooms? these are PNG rooms?
       ** allocate via a table
       ** subclass different rooms, use a setup() function for SimpleImage...
  (5) this ties into the interaction table...
------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.stateMachine.js"></script>
***********************************************************************************/

// Make global 
var adventureManager;


function preload() {
  adventureManager = new AdventureManager("data/adventureStates.csv", "data/interactionTable.csv");
}
// Setup code goes here
function setup() {
  createCanvas(1280, 720);

  adventureManager.setup();

  //print(states);
  //states = stateList;
  // states[stateBangkok].setup("assets/atariMaze.png");
  // states[stateLosAngeles].setup("assets/scribbleMaze.png");
  // states[stateBangkok].load();
  // states[stateLosAngeles].load();

  textAlign(CENTER);
  textSize(24);
}


// Draw code goes here
function draw() {
  background(255);
  // states[currentState].draw();

  adventureManager.draw();
}

function keyPressed() {
  adventureManager.keyPressed(key);
}

// function mouseReleased() {
//   currentState++;
//   if( currentState === states.length ) {
//     currentState = 0;
//   }
// }

//---------

