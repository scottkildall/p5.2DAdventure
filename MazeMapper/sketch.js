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
var collisionSX = [];
var collisionSY = [];
var collisionEX = [];
var collisionEY = [];

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
    fill(255,0,0);
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
  for( let i = 0; i < collisionSX.length; i++ ) {
    rectMode(CORNERS);
    noFill();
    stroke("#FFFFFF");
    strokeWeight(1);
    rect(collisionSX[i], collisionSY[i], collisionEX[i], collisionEY[i]);
  }
}


// need to account for x1 < x2 or x2 > x1, same for y1 and y2
function addCollisionRect(x1, y1, x2, y2) {
  if( x1 === x2 || y1 === y2 ) {
    print("bad collision rect");
    return;
  }

  // add to the array
  nextOffset = collisionSX.length;

  // now, we are saving by x,y and w,h
  collisionSX[nextOffset] = x1;
  collisionSY[nextOffset] = y1;
  collisionEX[nextOffset] = x2;
  collisionEY[nextOffset] = y2;

  // order it so that SX < EX and SY < EY
  let temp;
  if( collisionSX[nextOffset] > collisionEX[nextOffset] ) {
    temp = collisionSX[nextOffset];
    collisionSX[nextOffset] = collisionEX[nextOffset];
    collisionEX[nextOffset] = temp;
  }

  if( collisionSY[nextOffset] > collisionEY[nextOffset] ) {
    temp = collisionSY[nextOffset];
    collisionSY[nextOffset] = collisionEY[nextOffset];
    collisionEY[nextOffset] = temp;
  }
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
  collisionSX = roomObj.collisionSX;
  collisionSY = roomObj.collisionSY;
  collisionEX = roomObj.collisionEX;
  collisionEY = roomObj.collisionEY;
}

// makes null arrays of the 4 points
function clearCollisionRects() {
  collisionSX = [];
  collisionSY = [];
  collisionEX = [];
  collisionEX = [];
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
