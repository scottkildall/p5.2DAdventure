# p5.2DAdventure
#### by Scott Kildall
www.kildall.com


## Overview
Simple is working.

MazeMapper still in progress.


## ToDo
** Build in mouse events for a more complete no-inheritance maze

** Add p5.clickables to this

** Build in inheritance model with buttons

** change state callbacks for transitions

** Finish maze mapper with collision rects + instructions

## Errors in 2DAdventure

Because 2DAdventure.js abstracts a lot of the class allocation and management, the errors may seem obscure. Here are some of the ones you might encounter (ignore the line numbers)

### Classname Problem

If you have (1) a misspelled class name or a non-existent one in the adventureStates.csv table, you will get this error. In this case, I specified a class name called "Instructions Screen", but had not yes implemented it.

ReferenceError: InstructionsScreen is not defined
    at eval (eval at setup (p5.2DAdventure.js:37),
    

## Adding it your index.html

The easiest way to use this library it to place it in the same folder as your sketch.

Then, add the line below to the index.html file so that you can access it in your sketch.js

  <script src="p5.2DAdventure.js"></script>
  
## Setting up the CSV files

This can seem like the most confusing aspect of it, but once you get the hang of it, the navigation functions and automatic loading/unloading make the maze-mapping really easy.
### Simple

**_adventureStates.csv_** — this is the state machine map

**_interactionTable.csv_** — shows how you get from room to room


**_clickableLayout.csv_** - optional, if you want to use the layout tools with the forked p5.clickable class.


## Sketches
### Simple
This uses a 4 room, NW-NE-SE-SW maze. There's no splash screen or keyboard or mouse navigation, just avatar navigation with the interaction table.

### MoodyMaze

This has 9 maze rooms, 1 splash screen, 1 instructions screen and an avatar selection screen.

The Splash screen uses a a mouseclick to go to Instructions. Instructions will let you start the "game" (it's not really a game), or select an avatar. The 9 rooms all are in the interaction map. 

All rooms are of class type PNGRoom (built into 2DAdventure.js), except that InstructionsRoom and SelectAvatarRoom are subclassed from PNGRoom and in the sketch.js file.



## Functions

To be documented...


## License
CC BY: This license allows reusers to distribute, remix, adapt, and build upon the material in any medium or format, so long as attribution is given to the creator. The license allows for commercial use.
