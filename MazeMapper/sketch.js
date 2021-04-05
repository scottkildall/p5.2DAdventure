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

// collision rects
var collisionX = [];
var collisionY = [];
var collisionWidth = [];
var collisionHeight = [];

var startMouseX;
var startMouseY;

// current png filename
var pngFilename;

// current classname
var className;

// you can toggle this display
var showPlayerSprite = false;
var playerSprite = null;

function preload(){
  clickablesManager = new ClickableManager('data/clickableLayout.csv');
  adventureManager = new AdventureManager('data/adventureStates.csv', 'data/interactionTable.csv', 'data/clickableLayout.csv');

}

// Setup code goes here
function setup() {
  createCanvas(1280, 720);

  // setup the clickables = this will allocate the array
  clickables = clickablesManager.setup();

  // create a sprite and add the 3 animations
  playerSprite = createSprite(width/2, height/2, 80, 80);

  // every animation needs a descriptor, since we aren't switching animations, this string value doesn't matter
  playerSprite.addAnimation('regular', loadAnimation('assets/avatars/bubbly0001.png', 'assets/avatars/bubbly0004.png'));
  


  // this is optional but will manage turning visibility of buttons on/off
  // based on the state name in the clickableLayout
  adventureManager.setClickableManager(clickablesManager);

  
  // use this to track movement from toom to room in adventureManager.draw()
  adventureManager.setPlayerSprite(playerSprite);

    // This will load the images, go through state and interation tables, etc
  adventureManager.setup();

  pngFilename = adventureManager.getPNGFilename();
  className = adventureManager.getClassName();

  gState = kStateWait;
}

function draw() {
  if( gBlackBackground ) {
     background(0);
  } 
  else {
     background(255);
  }

  if( gState === kStateFirstMouse ) {
    tint(240);
  }
  else {
    noTint();
  }

  if( showPlayerSprite ) {
    moveSprite();
  }
  adventureManager.draw();

  push();

  // imageMode(CENTER);
  
  rectMode(CORNER);
  

  //noTint();
  if( gState === kStateFirstMouse ) {
    //tint(240);
    noFill();
    stroke("#FFFFFF");
    strokeWeight(1);
    
    rectMode(CORNERS);
    rect(startMouseX, startMouseY, mouseX, mouseY); 
  }
  
  drawCollisionRects();

  if( gState === kStateWait && gDrawInstructions ) {
    drawInstructions();
  }

  pop();


  // this is a function of p5.js, not of this sketch
  if( showPlayerSprite ) {
    drawSprite(playerSprite);
  }

  //clickablesManager.draw();
}


function keyPressed() {
  if( key === ' ') {
      gDrawInstructions = !gDrawInstructions;
  }

  // Next key, check for overflow
  if( key === 'n' ) {
    let newStateNum = adventureManager.getCurrentStateNum() + 1;
    if( newStateNum >= adventureManager.getNumStates() ) {
      newStateNum = 0;
    }
    updateStateNum(newStateNum);
  }

  // Prev key, check for underflow
  else if( key === 'p') {
    let newStateNum = adventureManager.getCurrentStateNum() - 1;
    if( newStateNum < 0) {
      newStateNum = adventureManager.getNumStates()-1;
    }
    updateStateNum(newStateNum);
  }

  else if( key === 'i') {
    gBlackBackground = !gBlackBackground;
  }

  // saves to your folder
  else if( key === 's' ) {
    saveCollisionRects();
  }

  // saves to your folder
  else if( key === 'a' ) {
    showPlayerSprite = !showPlayerSprite;
  }
}

function mouseReleased() {
  // XXX: do check for no states

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
  text( "Current file = " + pngFilename + "  |  ClassName = " + className, kDrawXInstructions, kDrawYInstructions+kTextLineHeight);
  text( "[n] for next room | [p] for previous room", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*2);
  
  text( "Type [i] to invert background", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*3);
  text( "Left/Right arrows to select rect", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*4);
  text( "Type [x] to delete rect", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*5);
  text( "Type [s] to save collision rects", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*6);
  text( "Type [a] to draw player sprite", kDrawXInstructions, kDrawYInstructions+kTextLineHeight*7);
 }

function drawCollisionRects() {

  //go thru collisionRects array and draw each
  for( let i = 0; i < collisionX.length; i++ ) {
    rectMode(CORNER);
    noFill();
    stroke("#FFFFFF");
    strokeWeight(1);
    rect(collisionX[i], collisionY[i], collisionWidth[i], collisionHeight[i]);
  }
}


// need to account for x1 < x2 or x2 > x1, same for y1 and y2
function addCollisionRect(x1, y1, x2, y2) {
  nextOffset = collisionX.length;

  let x,y,w,h;
  if( x1 <= x2 ) {
    x = x1;
    w = x2 - x1;
  } 
  else {
    x = x2;
    w = x1 - x2;
  }

  if( y1 <= y2 ) {
    y = y1;
    h = y2 - y1;
  } 
  else {
    y = y2;
    h = y1 - y2;
  }

  // now, we are saving by x,y and w,h
  collisionX[nextOffset] = x;
  collisionY[nextOffset] = y;
  print(collisionX);
  print(collisionWidth);
  print(collisionHeight);
  print(w);

  collisionWidth[nextOffset] = w;
  collisionHeight[nextOffset] = h;
}

// forces a save into downloads directory
function saveCollisionRects() {
  table = new p5.Table();

  table.addColumn('X');
  table.addColumn('Y');
  table.addColumn('Width');
  table.addColumn('Height');

  for( let i = 0; i < collisionX.length; i++ ) {
    let newRow = table.addRow();
    newRow.setNum('X', collisionX[i]);
    newRow.setNum('Y', collisionY[i]);
    newRow.setNum('Width', collisionWidth[i]);
    newRow.setNum('Height', collisionHeight[i]);
  }
  
  // converts .png or any file to .csv
  let pos = pngFilename.lastIndexOf(".");
  let csvFilename = pngFilename.substr(0, pos < 0 ? pngFilename.length : pos) + "_cl" + ".csv";

  saveTable(table, csvFilename);
}

function updateStateNum(newStateNum) {
  adventureManager.changeStateByNum(newStateNum);
  pngFilename = adventureManager.getPNGFilename();
  className = adventureManager.getClassName();
  clearCollisionRects();

  roomObj = adventureManager.states[adventureManager.getCurrentStateNum()];
  collisionX = roomObj.collisionX;
  collisionY = roomObj.collisionY;
  collisionWidth = roomObj.collisionWidth;
  collisionHeight = roomObj.collisionHeight;

  print("collisionX = " + collisionX);
}

// makes null arrays of the 4 points
function clearCollisionRects() {
  collisionX = [];
  collisionX = [];
  collisionWidth = [];
  collisionHeight = [];
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
