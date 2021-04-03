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

function preload(){
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  images[0] = loadImage("assets/atariMaze.png");
}

// Setup code goes here
function setup() {
  createCanvas(1280, 720);

  
  input = createFileInput(handleFile);
  input.position(0, 0);

  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();

  gState = kStateWait;


}

function draw() {
  push();
  imageMode(CENTER);
  rectMode(CORNER);


  if( gBlackBackground ) {
    background(0);
  } 
  else {
    background(255);
  }

  noTint();
  if( gState === kStateFirstMouse ) {
    tint(240);
    noFill();
    stroke("#FFFFFF");
    strokeWeight(1);
    
    rectMode(CORNERS);
    rect(startMouseX, startMouseY, mouseX, mouseY); 
  }

  image(images[0],width/2,height/2);

  drawCollisionRects();

  if( gState === kStateWait && gDrawInstructions ) {
    drawInstructions();
  }

  pop();

  //clickablesManager.draw();
}


function handleFile(file) {
  print(file);
  if (file.type === 'image') {
    print(file.name);
    img = createImg(file.data, '');
    img.hide();
    print(img);
    images[0] = img;
  } else {
    img = null;
  }
}

function keyPressed() {
  if( key === ' ') {
      gDrawInstructions = !gDrawInstructions;
  }

  else if( key === 'i') {
    gBlackBackground = !gBlackBackground;
  }
  
  else if( key === 's' ) {
    saveCollisionRects();
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

  //go thru collisionRects array and draw each
  for( let i = 0; i < collisionSX.length; i++ ) {
    rectMode(CORNERS);
    noFill();
    stroke("#FFFFFF");
    strokeWeight(1);
    rect(collisionSX[i], collisionSY[i], collisionEX[i], collisionEY[i]);
  }
}

function addCollisionRect(sx, sy, ex, ey) {
  nextOffset = collisionSX.length;

  collisionSX[nextOffset] = sx;
  collisionSY[nextOffset] = sy;
  collisionEX[nextOffset] = ex;
  collisionEY[nextOffset] = ey;
   
}

// forces a save into downloads directory
function saveCollisionRects() {
  table = new p5.Table();

  table.addColumn('sx');
  table.addColumn('sy');
  table.addColumn('ex');
  table.addColumn('ey');

  for( let i = 0; i < collisionSX.length; i++ ) {
    let newRow = table.addRow();
    newRow.setNum('sx', collisionSX[i]);
    newRow.setNum('sy', collisionSY[i]);
    newRow.setNum('ex', collisionEX[i]);
    newRow.setNum('ey', collisionEY[i]);
  }
  
  // hard-code name for right now - eventually generate from PNG
  saveTable(table, 'atariMaze.csv');
}


