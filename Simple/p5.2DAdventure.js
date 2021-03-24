/*******************************************************************************************************************
//
//  Class: State Machine
//  for P5.js
//
//  Written by Scott Kildall
*********************************************************************************************************************/

class StateMachine {
    // Store the duration and start the timer
    constructor() {
        this.states = [];
    }

    // copies an arrat of states (classes)
    register(stateClassList) {
        for( let i = 0; i < stateClassList.length; i++ ) {
            this.states[i] = new stateClassList[i];
            print(this.states[i]);
        }

        return this.states;
    }
}



class StateSimpleImage {
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
            background(128);
            return;
        }

        push();
        imageMode(CENTER);
        image(this.image,width/2,height/2);
        pop();
    }
}


