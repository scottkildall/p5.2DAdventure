/***********************************************************************************
  Simple
  by Scott Kildall

  Uses the p5.2DAdventure.js class 

  To do:
  ** cleanup p5.2DAdventure.js class + document it
  ** add support for sprite movement: 
    (1) move to corn has translation problems
    (2) need to tie into interaction map and shift to that state, constrain walls
  ** add mouse events, other interactions
  ** finish MazeMapper
  
------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/

// Make global 
var adventureManager;
var playerSprite;
var playerAnimation;

// Allocate Adventure Manager with states table and interaction tables
function preload() {
  adventureManager = new AdventureManager("data/adventureStates.csv", "data/interactionTable.csv");
}

// Setup the adventure manager
function setup() {
  createCanvas(1280, 720);

  // This will load the images, go through state and interation tables, etc
  adventureManager.setup();

    // create a sprite and add the 3 animations
  playerSprite = createSprite(width/2, height/2, 80, 80);
  playerSprite.addAnimation('regular', 'assets/blueblob-01.png', 'assets/blueblob-05.png');

  adventureManager.setPlayerSprite(playerSprite);

}

// Adventure manager handles it all!
function draw() {
  adventureManager.draw();

  // responds to keydowns...
  moveSprite();
  
///-- TO DO: add update() to adventure manager
  // add collision check here...figure out best way...
  //adventureManager.update()
  // if( playerSprite.position.y < 0 ) {
  //   // check for 
  // }


  drawSprites();
}

// pass to adventure manager, this do the draw / undraw events
function keyPressed() {
  // toggle fullscreen mode
  if( key === 'f') {
    fs = fullscreen();
    fullscreen(!fs);
  }

  adventureManager.keyPressed(key);  
}

function moveSprite() {
  if(keyIsDown(RIGHT_ARROW))
    playerSprite.velocity.x = 10;
  else if(keyIsDown(LEFT_ARROW))
    playerSprite.velocity.x = -10;
  else
    playerSprite.velocity.x = 0;

  if(keyIsDown(DOWN_ARROW))
    playerSprite.velocity.y = 10;
  else if(keyIsDown(UP_ARROW))
    playerSprite.velocity.y = -10;
  else
    playerSprite.velocity.y = 0;
}


//-------------- SUBCLASSES / YOUR DRAW CODE CAN GO HERE ---------------//
