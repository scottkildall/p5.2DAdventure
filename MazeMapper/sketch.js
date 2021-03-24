/***********************************************************************************
  MazeMapper
  by Scott Kildall

  Uses the p5.2DAdventure.js class

  Loads a series of PNG files from the assets folder and creates a collision map
    file for each one

  Show numbered rects as you

  Interactions:
  * first mouse release: defines start corner for rect (change to state drawing)
  * second mouse release: defines end corner for rect
  * ESC will stop the rect
  * 'i' to invert background
  * left/right arrow will cycle through the rects
  * 'x' will delete a rect
  * 's' to output CSV file
  * 'l' to read CSV file
  * ' ' to toggle display, including instructions

 ------------------------------------------------------------------------------------
	To use:
	Add this line to the index.html

  <script src="p5.2DAdventure.js"></script>
***********************************************************************************/


// state machine
var gState;
const kStateWait = 1;
const kStateFirstMouse = 2;

// drawing vars
var gBlackBackground = true;
var gDrawInstructions = true;
const kTextLineHeight = 16;
const kDrawYInstructions = 100;
const kDrawXInstructions = 20;

// array of images/filenames (to be developed...)
var images = [];

// collision rects
var collisionSX = [];
var collisionSY = [];
var collisionEX = [];
var collisionEY = [];

var startMouseX;
var startMouseY;

function preload() {
  images[0] = loadImage("assets/maze_test_wall.png");
}
// Setup code goes here
function setup() {
  createCanvas(1280, 720);

  imageMode(CENTER);
  rectMode(CORNER);

  gState = kStateWait;
}

function draw() {
  if( gBlackBackground ) {
    background(0);
  } 
  else {
    background(255);
  }

  noTint();
  if( gState === kStateFirstMouse ) {
    tint(128);
  }

  image(images[0],width/2,height/2);

  drawCollisionRects();

  if( gState === kStateWait && gDrawInstructions ) {
    drawInstructions();
  }
}


function keyPressed() {
  if( key === 'i') {
    gBlackBackground = !gBlackBackground;
  }
  if( key === ' ') {
      gDrawInstructions = !gDrawInstructions;
  }
}

function mouseReleased() {
  if( gState === kStateWait ) {
    startMouseX = mouseX;
    startMouseY = mouseY;
    gState = kStateFirstMouse;
  }
  else if( gState === kStateFirstMouse ) {
    if( startMouseX === mouseX || startMouseY === mouseY ) {
      // skip - no valid rect
    }
    else {
      addCollisionRect(startMouseX, startMouseY, mouseX, mouseY );
    }

    gState = kStateWait;
  }
}

function drawInstructions() {
  textSize(kTextLineHeight);
  textAlign(LEFT);

  if( gBlackBackground ) {
    fill(255);
  }
  else {
    fill(0);
  }

  text( "SPACE to toggle instructions", kDrawXInstructions, kDrawYInstructions);
  text( "Type [i] to invert background", kDrawXInstructions, kDrawYInstructions+kTextLineHeight);
  text( "Left/Right arrows to select rect", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*2);
  text( "Type [x] to delete rect", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*3);
  text( "Type [s] to save collision rects", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*4);
  text( "Type [l] to load collision rects", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*5);
}

function drawCollisionRects() {
  //go thry collisionRects array and draw each
}

function addCollisionRect(sx, sy, ex, ey) {

}


