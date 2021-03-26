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
            
            if( className === "PNGRoom" ) {
                // load the file from the table
                this.states[validStateCount].setup(this.statesTable.getString(i, 'PNGFilename'));
            }
            else if( className == "MazeRoom" ) {
                // do setup here
            }

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

    setPlayerSprite(s) {
        this.playerSprite = s;
    }

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
        // some crude hard-coded nonsense
        if(this.playerSprite.position.y < -1 ) {
            this.playerSprite.position = height - 1;
            this.changeState("Corn");
        }
        else if( this.playerSprite.position.x < -1 ) {
            this.playerSprite.position.x = 0;
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
        this.image = null;
        this.imagePath = null;
    }
}
