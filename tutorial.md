# Chess Move Generator - Tutorial

* Author: François Cardinaux
* Copyright: François Cardinaux, Genève, 2012
* Licence: see readme.md

The detailed description of the API is still missing, but can be deduced from the last lines of fhe <a href="https://github.com/fcardinaux/chess-move-generator.js/blob/master/coffee/chess-move-generator.coffee"><code>coffee/chess-move-generator.coffee</code></a> file.

## How to use the chess move generator in Node.js

If you want to use the chess move generator on your server, here is what you need to do:

* Downloaded the Javascript file `chess-move-generator.js` from Github.
* Place it inside the same folder as your Node.js application.
* Write the following code at the top of your script:

```javascript
chessMoveGenerator = require('./chess-move-generator');

// The classes:
var ChessPosition = chessMoveGenerator.position,
    ChessMove = chessMoveGenerator.move;
```

If you prefer to place the Javascript file in another folder, you need to adapt the path in the above script.

## How to use the chess move generator on a web page

If you want to use the chess move generator on a webpage, here is what you need to do:

* Downloaded the Javascript file `chess-move-generator.js` from Github.
* Place it inside the same folder as your Node.js application.
* Add the following tag [to your HTML markup](http://developer.yahoo.com/performance/rules.html#js_bottom):

```html
<script type="text/javascript" src="chess-move-generator.js"></script>
```

If you prefer to place the Javascript file in another folder, you need to adapt the path in the `src` attribute.

## Complete usage example with explanations

### ChessPosition instantiation, conversion to string and cloning

```javascript
// Instantiation
var position = ChessPosition.fromString( "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3 1 1" );

// The half-move clock and the move number aren't mandatory
var partialPosition = ChessPosition.fromString( "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3" ); // No counter

// Echoes "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3 1 1":
console.log( position.toString() );

// Echoes "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3":
console.log( position.toStringWithoutCounters() );

// Clones the position:
var newPosition = position.clone();
```

### Extraction of specific values

```javascript
// Echoes "b":
console.log( position.playerColorCode() );

// Echoes "w":
console.log( position.opponentColorCode() );

// Echoes false because the game is not ended:
console.log( position.isDraw() );

// Echoes false because the game is not ended:
console.log( position.getWinnerColorCode() );

// Now, let's instantiate a draw and two winning positions:
var drawPosition = ChessPosition.fromString( "4k3/4P3/4K3/8/8/8/8/8 b - -" ),
    whiteWinsPos = ChessPosition.fromString( "4k3/4Q3/4K3/8/8/8/8/8 b - -" ),
    blackWinsPos = ChessPosition.fromString( "4K3/4q3/4k3/8/8/8/8/8 w - -" );

// Echoes true:
console.log( drawPosition.isDraw() );

// Echoes "w":
console.log( whiteWinsPos.getWinnerColorCode() );

// Echoes "b":
console.log( blackWinsPos.getWinnerColorCode() );
```

### Move generation and verification

```javascript
var examplePositionA = ChessPosition.fromString( "4k2R/8/8/8/8/8/8/4K3 b - -" ),
    examplePositionB = ChessPosition.fromString( "4b2k/pppppppp/8/8/8/8/8/4K3 b - - 1 1" );

// Builds an array of ALL ChessMove instances from examplePositionA
var movesA = examplePositionA.allPossibleMoves(),
    moveQuantityA = movesA.length;

// Echoes six lines
// (see readme.md, "Conventions > Move representation"
// for more information about the move notation we use):
//      "e8f7"
//      "7R/5k2/8/8/8/8/8/4K3 w - -"
//      "e8e7"
//      "7R/4k3/8/8/8/8/8/4K3 w - -"
//      "e8d7"
//      "7R/3k4/8/8/8/8/8/4K3 w - -"
for (var iA = 0; iA < moveQuantityA; iA++) {
    console.log( movesA[iA].toString() );
    var newPos = movesA[iA].getNewPosition();
    console.log( newPos.toString() );
}

// Builds an array of the ChessMove instances from examplePositionB
// that start from square h7
// (see readme.md, "Conventions > Square representation"
// for more information about the square notation we use):
var movesB = examplePositionB.allPossibleMovesFrom(55), // = square h7
    moveQuantityB = movesB.length;

// Echoes four lines:
//      "h7h6"
//      "4b2k/1ppppppp/p7/8/8/8/8/4K3 w - - 0 2"
//      "h7h5"
//      "4b2k/1ppppppp/8/p7/8/8/8/4K3 w - a6 0 2"
for (var iB = 0; iB < moveQuantityB; iB++) {
    console.log( movesB[iB].toString() );
    var newPos = movesB[iB].getNewPosition();
    console.log( newPos.toString() );
}

// Now, let's verify that the following moves are allowed.
// All the following function should return true:

// Move h8h7 is allowed from examplePositionB:
console.log( examplePositionB.isValidMove(63, 62) ); // true

// Note that if the move is a promotion,
// you need to specify the desire piece as third parameter: 'q', 'r', 'n' or 'b'
var aboutToPromotePos = ChessPosition.fromString( "k7/7P/8/K7/8/8/8/8 w - -" );
console.log( aboutToPromotePos.isValidMove(55, 63, 'q') ); // true
```

### ChessMove instantiation and conversion to string

```javascript

// Instantiation of a king-side castling move:
var move11 = ChessMove.fromPositionAndMoveString( position, "e8g8" );

// Instantiation of the same move from its coordinates:
var move12 = ChessMove.fromPositionAndMoveData( position, 60, 62);

// Instantiation of a promotion move:
var move21 = ChessMove.fromPositionAndMoveData( aboutToPromotePos, "h7h8q");

// Instantiation of the same move from its coordinates:
var move22 = ChessMove.fromPositionAndMoveData( aboutToPromotePos, 55, 63, 'q');

// Conversion to string:
console.log( move11.toString() ); // "e8g8"
console.log( move12.toString() ); // "e8g8"
console.log( move21.toString() ); // "h7h8q"
console.log( move22.toString() ); // "h7h8q"

// Getting the new position after a move
var promotedPosition = move21.getNewPosition() // An instance of ChessPosition

// An attempt to instantiate an invalid move returns `false`:
var invalidMove = chessMove.fromPositionAndMoveString( position, "e8e7"); // Blocked by the black queen
console.log( invalidMove ); // echoes false
```
