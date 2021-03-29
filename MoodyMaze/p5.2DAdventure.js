/*******************************************************************************************************************
//
//  p5.2DAdventure
//  for P5.js
//
//  Written by Scott Kildall
//
//  Very Much in Progress
*********************************************************************************************************************/

class AdventureManager {
    constructor(statesFilename, interactionFilename) {
        this.backgroundColor = color("#000000");
        this.currentState = 0;
        this.currentStateName = "";
        this.hasValidStates = false;
        this.states = [];
        this.statesTable = loadTable(statesFilename, 'csv', 'header');
        this.interactionTable = loadTable(interactionFilename, 'csv', 'header');
        this.playerSprite = null;
    }

    // expects as .csv file with the format as outlined in the readme file
    setup() {
        let validStateCount = 0;
        // For each row, allocate a clickable object
        for( let i = 0; i < this.statesTable.getRowCount(); i++ ) {
            let className = this.statesTable.getString(i, 'ClassName');
            
            // if we have an image, we will call setImage() to load that image into that p5.clickable
            if( className === "" ) {
                print("empty className field in line #" + i + " of states file");
                return false;    
            }
           
            // this is the allocator itself
            this.states[validStateCount] = eval("new " + className);
            
            // All classes (for now) have a PNGFilename, could add a blank room
            this.states[validStateCount].setup(this.statesTable.getString(i, 'PNGFilename'));

/*
            if( className === "PNGRoom" ) {
                // load the file from the table
                this.states[validStateCount].setup(this.statesTable.getString(i, 'PNGFilename'));
            }
            else if( className == "MazeRoom" ) {
                // do setup here
            }
*/
             validStateCount++;
        }
    
        if( validStateCount > 0 ) {
            this.hasValidStates = true;
            this.states[0].load();
            this.currentStateName = this.statesTable.getString(0, 'StateName');
        }
        else {
            this.hasValidStates = false;
        }

        return this.hasValidStates;
    }

    // accessor for the state name
    getStateName() {
        return this.currentStateName;
    }

    // from the p5.play class
    setPlayerSprite(s) {
        this.playerSprite = s;
    }

    // call on every draw loop from the p5 sketch
    draw() {
        if( !this.hasValidStates ) {
            background(128);
        }
        else {
            this.checkPlayerSprite();
            background(this.backgroundColor);
            this.states[this.currentState].draw();
        }
    }

    // move to interation table!
    keyPressed(keyChar) {
       // go through each row, look for a match to the current state
      for (let i = 0; i < this.interactionTable.getRowCount(); i++) {

        // the .name property of a function will convert function to string for comparison
        if(this.currentStateName === this.interactionTable.getString(i, 'CurrentState') ) {
            // now, look for a match with the key typed, converting it to a string
            if( this.interactionTable.getString(i, 'KeyTyped') === String(keyChar) ) {
                // if a match, set the drawFunction to the next state, eval() converts
                // string to function
                this.changeState(this.interactionTable.getString(i, 'NextState') );
                break;
            }
        }
      }
    }

    // Right now, just support for mouse released, but in future will have
    // other events like mouse pressed or moved, etc.
    mouseReleased() {
        this.mouseEvent("mouseReleased");
    }


 //-- PRIVATE FUNCTIONS: don't call these --//   

    // Called essentially as a private function for mouseReleased(), mousePressed(), etc to
    // process the mouseEvent column interaction table
    mouseEvent(mouseStr) {
       // go through each row, look for a match to the current state
      for (let i = 0; i < this.interactionTable.getRowCount(); i++) {
        // the .name property of a function will convert function to string for comparison
        if(this.currentStateName === this.interactionTable.getString(i, 'CurrentState') ) {
            // now, look for a match with the key typed, converting it to a string
            if( this.interactionTable.getString(i, 'MouseEvent') === mouseStr ) {
                // if a match, set the drawFunction to the next state, eval() converts
                // string to function
                this.changeState(this.interactionTable.getString(i, 'NextState') );
                break;
            }
        }
      }
    }
    
    // OPTIMIZATION: load all the state/interaction tables etc into an array with just
    // those state entries for faster navigation
    // newState is a STRING
    changeState(newStateStr) {
        let newStateNum = this.getStateNumFromString(newStateStr);
        print( "new state num = " + newStateNum);
        if( newStateNum === -1 ) {
            print("can't find stateNum from string: " + newStateStr);

        }
        if( this.currentState === newStateNum ) {
            return;
        }

        print("new state =" + newStateStr);

        this.states[this.currentState].unload();
        this.states[newStateNum].load();
        this.currentState = newStateNum;

        // store new state name from states table
        this.currentStateName = newStateStr;
    }

    getStateNumFromString(stateStr) {
        for (let i = 0; i < this.statesTable.getRowCount(); i++) {
            if( stateStr === this.statesTable.getString(i, 'StateName') ) {
                return i;
            }
        }

        // error!!
        return -1;
    }

    checkPlayerSprite() {
        let direction = this.checkSpriteBounds();
        
        // empty string returned if we are in the room still
        if( direction !== "") {
            let stateChanged = false;

            // go through each row, look for a match to the current state
            for (let i = 0; i < this.interactionTable.getRowCount(); i++) {
                 // the .name property of a function will convert function to string for comparison
                if(this.currentStateName === this.interactionTable.getString(i, 'CurrentState') ) {
                    // now, look for a match with the direction, converting it to a string
                    if( direction === this.interactionTable.getString(i, 'MapDirection') ) {
                        // if a match, set the drawFunction to the next state, eval() converts
                        // string to function
                        this.changeState(this.interactionTable.getString(i, 'NextState') );
                        stateChanged = true; 

                        this.adjustSpriteForRoom();
                        break;
                    }
                }
            }
            
            // state never changed, so we stick at edge
            if( !stateChanged ) {
                this.constrainSpriteBounds();
            }
        }
    }

    // return direction we are out of bounds to match interaction map
    checkSpriteBounds() {
        if( this.playerSprite.position.x < -1 ) {
            return "W";
        }
        else if( this.playerSprite.position.x > width ) {
            return "E";
        }
        else if( this.playerSprite.position.y < -1 ) {
            return "N";
        }
        else if( this.playerSprite.position.y > height ) {
            return "S";
        }

        return "";
    }

    adjustSpriteForRoom() {
        if( this.playerSprite.position.x < -1 ) {
            playerSprite.position.x = width;
        }
        else if( this.playerSprite.position.x > width ) {
            playerSprite.position.x = 0;
        }
        else if( this.playerSprite.position.y < -1 ) {
            playerSprite.position.y = height;
        }
        else if( this.playerSprite.position.y > height ) {
            playerSprite.position.y = 0;
        }
    }

    // no room, constrain to edges
    constrainSpriteBounds() {
        if(this.playerSprite.position.x < -1 ) {
            this.playerSprite.position.x = 0;
        }
        else if(this.playerSprite.position.x > width+1 ) {
            this.playerSprite.position.x = width;
            //this.changeState("Maze_NE");
        }
        else if(this.playerSprite.position.y < -1 ) {
            this.playerSprite.position.y = 0;
        }
        else if(this.playerSprite.position.y > height ) {
            this.playerSprite.position.y = height;
            //this.changeState("Maze_NE");
        }
    }
}


class PNGRoom {
    constructor() {
        this.image = null;
        this.imagePath = null;
    }

    setup(_imagePath) {
        this.imagePath = String(_imagePath);
    }

    load() {
        this.image = loadImage(this.imagePath);
    }

    unload() {
        this.image = null;
    }

    draw() {
        if( this.image === null ) {
            background(64);
            return;
        }

        push();
        imageMode(CENTER);
        image(this.image,width/2,height/2);
        pop();
    }
}

class MazeRoom extends PNGRoom {
    constructor() {
        super();
        this.image = null;
        this.imagePath = null;
    }

  
}


