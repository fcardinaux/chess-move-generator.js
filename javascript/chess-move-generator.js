/*
Chess Move Generator
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md

Short reminder of ASCII:
    character   code
    0           48
    A           65
    Z           90
    a           97

The board and the square codes (note that we don't use the 0x88 representation here, because of the bitboards):
    * decimal value
    * octal value

    +-----+-----+-----+-----+-----+-----+-----+-----+
   8|  56 |  57 |  58 |  59 |  60 |  61 |  62 |  63 |
    |  70 |  71 |  72 |  73 |  74 |  75 |  76 |  77 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   7|  48 |  49 |  50 |  51 |  52 |  53 |  54 |  55 |
    |  60 |  61 |  62 |  63 |  64 |  65 |  66 |  67 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   6|  80 |  81 |  82 |  83 |  84 |  85 |  86 |  87 |
    |  50 |  51 |  52 |  53 |  54 |  55 |  56 |  57 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   5|  32 |  33 |  34 |  35 |  36 |  37 |  38 |  39 |
    |  40 |  41 |  42 |  43 |  44 |  45 |  46 |  47 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   4|  24 |  25 |  26 |  27 |  28 |  29 |  30 |  31 |
    |  30 |  31 |  32 |  33 |  34 |  35 |  36 |  37 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   3|  16 |  17 |  18 |  19 |  20 |  21 |  22 |  23 |
    |  20 |  21 |  22 |  23 |  24 |  25 |  26 |  27 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   2|   8 |   9 |  10 |  11 |  12 |  13 |  14 |  15 |
    |  10 |  11 |  12 |  13 |  14 |  15 |  16 |  17 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   1|   0 |   1 |   2 |   3 |   4 |   5 |   6 |   7 |
    |   0 |   1 |   2 |   3 |   4 |   5 |   6 |   7 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
       A     B     C     D     E     F     G     H

The board in four bitboard quadrants (due to integer limitations in JavaScript):

    +---+---+---+---+---+---+---+---+
   8|   |   |   |   |   |   |   |   |
    +-             -+-             -+
   7|               |               |
    +-      2      -+-      3      -+
   6|               |               |
    +-             -+-             -+
   5|   |   |   |   |   |   |   |   |
    +---+---+---+---+---+---+---+---+
   4|   |   |   |   |   |   |   |   |
    +-             -+-             -+
   3|               |               |
    +-      0      -+-      1      -+
   2|               |               |
    +-             -+-             -+
   1|   |   |   |   |   |   |   |   |
    +---+---+---+---+---+---+---+---+
      A   B   C   D   E   F   G   H

Numbering of each bitboard quadrant (hexadecimal here)

    +---+---+---+---+
   4| C | D | E | F |
    +---+---+---+---+
   3| 8 | 9 | A | B |
    +---+---+---+---+
   2| 4 | 5 | 6 | 7 |
    +---+---+---+---+
   1| 0 | 1 | 2 | 3 |
    +---+---+---+---+
      A   B   C   D


Todos:
* Operations of loadMoves, loadPawnNonTakingMoves, loadPawnTakingMoves and loadShadows can be done in one loop block

Definitions:

* "Pseudo-legal moves are all moves that follows the basic move rules.
  I.e. the move does not take the piece off the board, or captures own pieces.
  But it might leave the own king in check, castle while in check
  or castle over a checked square." ( -> Jonatan Pettersson's Move generation)
*/
var CMGMove, CMGPiece, CMGPosition, bishopBitBoardStringArray, bitBoardStringArrayToIntegers, kingBitBoardStringArray, knightBitBoardStringArray, loadMoves, loadPawnNonTakingMoves, loadPawnTakingMoves, loadShadows, pawnMoveBitBoardStringArray, pawnStartingMoveBitBoardStringArray, pawnTakeBitBoardStringArray, queenBitBoardStringArray, rookBitBoardStringArray, shadow_E_BitBoardStringArray, shadow_NE_BitBoardStringArray, shadow_NW_BitBoardStringArray, shadow_N_BitBoardStringArray, shadow_SE_BitBoardStringArray, shadow_SW_BitBoardStringArray, shadow_S_BitBoardStringArray, shadow_W_BitBoardStringArray;

queenBitBoardStringArray = ['100000010000001', '010000010000010', '001000010000100', '000100010001000', '000010010010000', '000001010100000', '000000111000000', '111111101111111', '000000111000000', '000001010100000', '000010010010000', '000100010001000', '001000010000100', '010000010000010', '100000010000001'];

rookBitBoardStringArray = ['000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '111111101111111', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000'];

bishopBitBoardStringArray = ['100000000000001', '010000000000010', '001000000000100', '000100000001000', '000010000010000', '000001000100000', '000000101000000', '000000000000000', '000000101000000', '000001000100000', '000010000010000', '000100000001000', '001000000000100', '010000000000010', '100000000000001'];

knightBitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000101000000', '000001000100000', '000000000000000', '000001000100000', '000000101000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

kingBitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000111000000', '000000101000000', '000000111000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

pawnMoveBitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000010000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

pawnStartingMoveBitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000010000000', '000000010000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

pawnTakeBitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000101000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

shadow_NW_BitBoardStringArray = ['100000000000000', '010000000000000', '001000000000000', '000100000000000', '000010000000000', '000001000000000', '000000100000000', '000000010000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

shadow_SW_BitBoardStringArray = shadow_NW_BitBoardStringArray.reverse();

shadow_N_BitBoardStringArray = ['000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000010000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

shadow_S_BitBoardStringArray = shadow_N_BitBoardStringArray.reverse();

shadow_NE_BitBoardStringArray = ['000000000000001', '000000000000010', '000000000000100', '000000000001000', '000000000010000', '000000000100000', '000000001000000', '000000010000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

shadow_SE_BitBoardStringArray = shadow_NE_BitBoardStringArray.reverse();

shadow_W_BitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '111111110000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

shadow_E_BitBoardStringArray = ['000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000011111111', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000', '000000000000000'];

bitBoardStringArrayToIntegers = function(bitBoardStringArray, offsetY, offsetX) {
  var bottomLeft, bottomRight, line, lineId, line_16_8, rectangle_16_8, square_8_8, start, topLeft, topRight, _i, _len, _len2;
  start = 7 - offsetY;
  rectangle_16_8 = bitBoardStringArray.slice(start);
  if (start < 7) rectangle_16_8 = rectangle_16_8.slice(0, 8);
  square_8_8 = [];
  for (_i = 0, _len = rectangle_16_8.length; _i < _len; _i++) {
    line_16_8 = rectangle_16_8[_i];
    square_8_8.push(line_16_8.substr(offsetX, 8));
  }
  topLeft = topRight = bottomLeft = bottomRight = [];
  for (lineId = 0, _len2 = square_8_8.length; lineId < _len2; lineId++) {
    line = square_8_8[lineId];
    if (lineId < 4) {
      topLeft.push(line.substr(0, 4));
      topRight.push(line.substr(4));
    } else {
      bottomLeft.push(line.substr(0, 4));
      bottomRight.push(line.substr(4));
    }
  }
  return [parseInt(bottomLeft.join(''), 2), parseInt(bottomRight.join(''), 2), parseInt(topLeft.join(''), 2), parseInt(topRight.join(''), 2)];
};

loadMoves = function(bitBoardStringArray) {
  var iCol, iRow, out;
  out = [];
  for (iRow = 7; iRow >= 0; iRow--) {
    for (iCol = 7; iCol >= 0; iCol--) {
      out.push(bitBoardStringArrayToIntegers(bitBoardStringArray, iRow, iCol));
    }
  }
  return out;
};

loadPawnNonTakingMoves = function(color) {
  var arrayOp, iCol, iRow, ordinaryMoveArr, out, row2MoveArr, row7MoveArr;
  if (color === 'w') {
    arrayOp = function(arr) {
      return arr;
    };
  } else {
    arrayOp = function(arr) {
      return arr.reverse();
    };
  }
  ordinaryMoveArr = arrayOp(pawnMoveBitBoardStringArray);
  if (color === 'b') {
    row2MoveArr = arrayOp(pawnMoveBitBoardStringArray);
    row7MoveArr = arrayOp(pawnStartingMoveBitBoardStringArray);
  } else {
    row2MoveArr = arrayOp(pawnStartingMoveBitBoardStringArray);
    row7MoveArr = arrayOp(pawnMoveBitBoardStringArray);
  }
  out = [];
  for (iRow = 6; iRow >= 1; iRow--) {
    for (iCol = 7; iCol >= 0; iCol--) {
      switch (iRow) {
        case 6:
          out.push(bitBoardStringArrayToIntegers(row2MoveArr, iRow, iCol));
          break;
        case 1:
          out.push(bitBoardStringArrayToIntegers(row7MoveArr, iRow, iCol));
          break;
        default:
          out.push(bitBoardStringArrayToIntegers(ordinaryMoveArr, iRow, iCol));
      }
    }
  }
  return out;
};

loadPawnTakingMoves = function(color) {
  var arrayOp, iCol, iRow, out, takingMoveArr;
  if (color === 'w') {
    arrayOp = function(arr) {
      return arr;
    };
  } else {
    arrayOp = function(arr) {
      return arr.reverse();
    };
  }
  takingMoveArr = arrayOp(pawnTakeBitBoardStringArray);
  out = [];
  for (iRow = 6; iRow >= 1; iRow--) {
    for (iCol = 7; iCol >= 0; iCol--) {
      out.push(bitBoardStringArrayToIntegers(takingMoveArr, iRow, iCol));
    }
  }
  return out;
};

loadShadows = function() {
  var fcts, iCol, iDirection, iRow, out;
  fcts = [shadow_N_BitBoardStringArray, shadow_NE_BitBoardStringArray, shadow_E_BitBoardStringArray, shadow_SE_BitBoardStringArray, shadow_S_BitBoardStringArray, shadow_SW_BitBoardStringArray, shadow_W_BitBoardStringArray, shadow_NW_BitBoardStringArray];
  out = [];
  for (iRow = 7; iRow >= 0; iRow--) {
    for (iCol = 7; iCol >= 0; iCol--) {
      for (iDirection = 0; iDirection <= 7; iDirection++) {
        out.push(bitBoardStringArrayToIntegers(fcts[iDirection], iRow, iCol));
      }
    }
  }
  return out;
};

CMGPosition = (function() {

  CMGPosition.ROW_SPAN = 8;

  CMGPosition.BOTTOM_LEFT_CORNER = 0;

  CMGPosition.BOTTOM_RIGHT_CORNER = 7;

  CMGPosition.TOP_LEFT_CORNER = 070;

  CMGPosition.TOP_RIGHT_CORNER = 077;

  CMGPosition.CASTLING_ALL = 15;

  CMGPosition.CASTLING_WHITE_KING = 8;

  CMGPosition.CASTLING_WHITE_QUEEN = 4;

  CMGPosition.CASTLING_BLACK_KING = 2;

  CMGPosition.CASTLING_BLACK_QUEEN = 1;

  CMGPosition.QUEEN_MOVES = loadMoves(queenBitBoardStringArray);

  CMGPosition.ROOK_MOVES = loadMoves(rookBitBoardStringArray);

  CMGPosition.BISHOP_MOVES = loadMoves(bishopBitBoardStringArray);

  CMGPosition.KNIGHT_MOVES = loadMoves(knightBitBoardStringArray);

  CMGPosition.KING_MOVES_WITHOUT_CASTLING = loadMoves(kingBitBoardStringArray);

  CMGPosition.PAWN_NON_TAKING_MOVES = {
    b: loadPawnNonTakingMoves('b'),
    w: loadPawnNonTakingMoves('w')
  };

  CMGPosition.PAWN_TAKING_MOVES = {
    b: loadPawnTakingMoves('b'),
    w: loadPawnTakingMoves('w')
  };

  CMGPosition.SHADOWS = loadShadows();

  CMGPosition._shadow = function(direction) {};

  CMGPosition._light = function(direction) {
    return this._shadow(direction ^ 4);
  };

  CMGPosition.fromString = function(positionString) {
    /*
            Get an object instance from its Forsyth-Edwards representation
    */
    var allowedCastling, allowedCastlingString, boardString, elements, enPassantSquare, enPassantString, halfMoveClock, moveNumber, pieces, turn, turnChar;
    elements = positionString.split(' ');
    boardString = elements[0], turnChar = elements[1], allowedCastlingString = elements[2], enPassantString = elements[3];
    halfMoveClock = 0;
    moveNumber = 1;
    switch (elements.length) {
      case 5:
        halfMoveClock = parseInt(elements[4]);
        break;
      case 6:
        halfMoveClock = parseInt(elements[4]);
        moveNumber = parseInt(elements[5]);
    }
    pieces = CMGPosition._boardStringToPieces(boardString);
    allowedCastling = CMGPosition._allowedCastlingStringToValue(allowedCastlingString);
    enPassantSquare = CMGPosition._enPassantStringToSquare(enPassantString);
    turn = CMGPosition._turnCharToValue(turnChar);
    return new CMGPosition(pieces, turn, allowedCastling, enPassantSquare, halfMoveClock, moveNumber);
  };

  CMGPosition._boardStringToPieces = function(boardString) {
    var rowStrings;
    rowStrings = boardString.split('/').reverse();
    return CMGPosition._rowStringsToPieces(rowStrings);
  };

  CMGPosition._rowStringsToPieces = function(rowStrings, pieces, rowId) {
    var rowString, _len;
    if (pieces == null) pieces = [];
    if (rowId == null) rowId = 0;
    if (rowStrings.length !== 8) throw "Incorrect number of rows in " + rowStrings;
    pieces = {};
    for (rowId = 0, _len = rowStrings.length; rowId < _len; rowId++) {
      rowString = rowStrings[rowId];
      pieces = CMGPosition._squareCharsToPieces(rowString.split(''), pieces, rowId * CMGPosition.ROW_SPAN, rowId * CMGPosition.ROW_SPAN + 7);
    }
    return pieces;
  };

  CMGPosition._squareCharsToPieces = function(rowChars, pieces, currentSquareId, lastSquareIdOfRow) {
    var rowChar, _i, _len;
    for (_i = 0, _len = rowChars.length; _i < _len; _i++) {
      rowChar = rowChars[_i];
      switch (rowChar) {
        case '1':
          currentSquareId += 1;
          break;
        case '2':
          currentSquareId += 2;
          break;
        case '3':
          currentSquareId += 3;
          break;
        case '4':
          currentSquareId += 4;
          break;
        case '5':
          currentSquareId += 5;
          break;
        case '6':
          currentSquareId += 6;
          break;
        case '7':
          currentSquareId += 7;
          break;
        case '8':
          currentSquareId += 8;
          break;
        default:
          pieces[currentSquareId] = CMGPiece.fromChar(rowChar);
          currentSquareId += 1;
      }
    }
    return pieces;
  };

  CMGPosition._allowedCastlingStringToValue = function(allowedCastlingString) {
    var func;
    func = function(acc, pce) {
      switch (pce) {
        case 'K':
          return acc + CMGPosition.CASTLING_WHITE_KING;
        case 'Q':
          return acc + CMGPosition.CASTLING_WHITE_QUEEN;
        case 'k':
          return acc + CMGPosition.CASTLING_BLACK_KING;
        case 'q':
          return acc + CMGPosition.CASTLING_BLACK_QUEEN;
      }
      return acc;
    };
    return allowedCastlingString.split('').reduce(func, 0);
  };

  CMGPosition._allowedCastlingValueToString = function(allowedCastling) {
    var allowedCastlingString, bkChar, bqChar, wkChar, wqChar;
    wqChar = wkChar = bqChar = bkChar = '';
    if (allowedCastling & CMGPosition.CASTLING_WHITE_QUEEN) wqChar = 'Q';
    if (allowedCastling & CMGPosition.CASTLING_WHITE_KING) wkChar = 'K';
    if (allowedCastling & CMGPosition.CASTLING_BLACK_QUEEN) bqChar = 'q';
    if (allowedCastling & CMGPosition.CASTLING_BLACK_KING) bkChar = 'k';
    allowedCastlingString = [wkChar, wqChar, bkChar, bqChar].join('');
    if (allowedCastlingString === '') return '-';
    return allowedCastlingString;
  };

  CMGPosition._enPassantStringToSquare = function(enPassantString) {
    var colValue, rowValue;
    if (enPassantString === '-') return false;
    if (enPassantString.length !== 2) {
      throw "Invalid en-passant string: " + enPassantString;
    }
    colValue = enPassantString.charCodeAt(0) - 97;
    rowValue = enPassantString.charCodeAt(1) - 49;
    return CMGPosition._squareReference(rowValue, colValue);
  };

  CMGPosition._turnCharToValue = function(turnChar) {
    if (turnChar !== 'b' && turnChar !== 'w') {
      throw "Invalid turn character: " + turnChar;
    }
    return turnChar;
  };

  CMGPosition._squareReference = function(rowId, colId) {
    return CMGPosition.ROW_SPAN * rowId + colId;
  };

  CMGPosition._getPieceOnSquare = function(item, squareKey) {
    var pieces;
    pieces = null;
    if (item instanceof CMGPosition) {
      pieces = item.pieces;
    } else {
      pieces = item;
    }
    if (!pieces.hasOwnProperty(squareKey)) return false;
    return pieces[squareKey];
  };

  function CMGPosition(pieces, turn, allowedCastling, enPassantSquare, halfMoveClock, moveNumber) {
    this.pieces = pieces;
    this.turn = turn;
    this.allowedCastling = allowedCastling != null ? allowedCastling : 0;
    this.enPassantSquare = enPassantSquare != null ? enPassantSquare : false;
    this.halfMoveClock = halfMoveClock != null ? halfMoveClock : 0;
    this.moveNumber = moveNumber != null ? moveNumber : 0;
    /*
            Constructor
            @param pieces ([CMGPiece])
            @param turn (false|"b"|"w")
            @param allowedCastling (integer)
            @param enPassantSquare (false|integer where integer is between 0 (bottom right corner) and 077 (top right corner)
            @param halfMoveClock (integer)
            @param moveNumber (integer)
    */
    this.bitBoards = {};
    this._generateBitBoards();
  }

  CMGPosition.prototype.playerColorCode = function() {
    return this.turn;
  };

  CMGPosition.prototype.opponentColorCode = function() {
    switch (this.turn) {
      case "b":
        return "w";
      case "w":
        return "b";
    }
    return false;
  };

  CMGPosition.prototype.toString = function() {
    /*
            Get the Forsyth-Edwards representation of the object
    */    return [this.toStringWithoutCounters(), this.halfMoveClock, this.moveNumber].join(' ');
  };

  CMGPosition.prototype.toStringWithoutCounters = function() {
    var allowedCastlingString, boardString, enPassantString, turnChar;
    boardString = this._piecesToBoardString(this.pieces);
    turnChar = this.turn;
    allowedCastlingString = CMGPosition._allowedCastlingValueToString(this.allowedCastling);
    enPassantString = this._enPassantSquareToString(this.enPassantSquare);
    return [boardString, turnChar, allowedCastlingString, enPassantString].join(' ');
  };

  CMGPosition.prototype.isValidMove = function(fromSquare, toSquare, promotion) {
    if (promotion == null) promotion = false;
    return 'todo implement';
  };

  CMGPosition.prototype.allPossibleMovesFromSquare = function(_) {
    return [];
  };

  CMGPosition.prototype.allPossibleMoves = function() {
    var moves, piece, result, square, _ref;
    result = [];
    _ref = this.pieces;
    for (square in _ref) {
      piece = _ref[square];
      if (piece.color !== this.turn) continue;
      moves = this.allPossibleMovesFromSquare(square);
      if (moves.length > 0) result = result.concat(moves);
    }
    return result;
  };

  CMGPosition.prototype.isDraw = function() {
    /*
            Is the position a draw
            @return boolean
    */    return 'todo';
  };

  CMGPosition.prototype.getWinnerColorCode = function() {
    /*
            Get the winner color code
            @return (false|'b'|'w')
    */    return 'todo';
  };

  CMGPosition.prototype._piecesToBoardString = function() {
    return (this._piecesToRowStrings()).join('/');
  };

  CMGPosition.prototype._piecesToRowStrings = function() {
    var rowId, rowStrings;
    rowId = 8;
    rowStrings = [];
    while (rowId > 0) {
      rowId--;
      rowStrings.push(this._piecesOnRowToRowString(rowId));
    }
    return rowStrings;
  };

  CMGPosition.prototype._piecesOnRowToRowString = function(rowId) {
    var colId, emptySquareCounter, pieceChar, pieceFound, rowChars, squareKey;
    colId = 0;
    rowChars = [];
    emptySquareCounter = 0;
    while (colId < 8) {
      squareKey = CMGPosition._squareReference(rowId, colId);
      pieceFound = this._getPieceOnSquare(squareKey);
      if (pieceFound === false) {
        emptySquareCounter++;
      } else {
        pieceChar = pieceFound.toChar();
        if (emptySquareCounter > 0) rowChars.push(emptySquareCounter);
        rowChars.push(pieceChar);
        emptySquareCounter = 0;
      }
      colId++;
    }
    if (emptySquareCounter !== 0) rowChars.push(emptySquareCounter);
    return rowChars.join('');
  };

  CMGPosition.prototype._enPassantSquareToString = function(squareNumber) {
    if (squareNumber === false) return '-';
    return this._squareToString(squareNumber);
  };

  CMGPosition.prototype._squareToString = function(squareNumber) {
    var colValue, rowValue;
    rowValue = Math.floor(squareNumber / CMGPosition.ROW_SPAN);
    colValue = squareNumber % CMGPosition.ROW_SPAN;
    return String.fromCharCode(colValue + 97) + String.fromCharCode(rowValue + 49);
  };

  CMGPosition.prototype._getPieceOnSquare = function(squareKey) {
    return CMGPosition._getPieceOnSquare(this.pieces, squareKey);
  };

  CMGPosition.prototype._generateBitBoards = function() {
    var bvs, color, square, type, _ref, _ref2, _results;
    this.bitBoards.allPieces = 0x0;
    this.bitBoards.allPiecesOfColorAndType = {
      'b': {
        'r': 0x0,
        'n': 0x0,
        'b': 0x0,
        'k': 0x0,
        'q': 0x0,
        'p': 0x0
      },
      'w': {
        'r': 0x0,
        'n': 0x0,
        'b': 0x0,
        'k': 0x0,
        'q': 0x0,
        'p': 0x0
      }
    };
    _ref = this.pieces;
    _results = [];
    for (square in _ref) {
      _ref2 = _ref[square], color = _ref2.color, type = _ref2.type;
      bvs = this._bitValueOfSquare(square);
      this.bitBoards.allPieces |= bvs;
      _results.push(this.bitBoards.allPiecesOfColorAndType[color][type] |= bvs);
    }
    return _results;
  };

  CMGPosition.prototype._bitValueOfSquare = function(square) {
    return Math.pow(2, square);
  };

  return CMGPosition;

})();

CMGMove = (function() {

  function CMGMove(fromSquare, fromPiece, toSquare, toPiece, newPosition, castling, takenPiece, takenOnSquare) {
    this.fromSquare = fromSquare;
    this.fromPiece = fromPiece;
    this.toSquare = toSquare;
    this.toPiece = toPiece;
    this.newPosition = newPosition;
    this.castling = castling != null ? castling : false;
    this.takenPiece = takenPiece != null ? takenPiece : false;
    this.takenOnSquare = takenOnSquare != null ? takenOnSquare : false;
    /*
            Constructor
            @param fromSquare (integer)
            @param fromPiece (CMGPiece)
            @param toSquare (integer)
            @param toPiece (CMGPiece)
            @param newPosition (CMGPosition)
            @param castling (false|"q"|"k")
            @param takenPiece (false|CMGPiece)
            @param takenOnSquare (false|integer)
    */
  }

  CMGMove.prototype.toString = function() {
    throw "Todo: implement";
  };

  return CMGMove;

})();

CMGPiece = (function() {

  function CMGPiece(color, type) {
    this.color = color;
    this.type = type;
    /*
            Constructor
            @param color ("b"|"w") black or white
            @param type ("p"|"n"|b"|"r"|"q"|"k") pawn, knight, bishop, rook, queen or king
    */
  }

  CMGPiece.fromChar = function(pieceChar) {
    var color, piece, _ref;
    _ref = CMGPiece._charToInternalRepresentation(pieceChar), color = _ref[0], piece = _ref[1];
    return new CMGPiece(color, piece);
  };

  CMGPiece._charToInternalRepresentation = function(pieceChar) {
    var charCode, color, piece;
    charCode = pieceChar.charCodeAt(0);
    color = 'b';
    piece = null;
    if (charCode < 97) {
      color = 'w';
      charCode += 32;
    }
    if (charCode !== 114 && charCode !== 110 && charCode !== 98 && charCode !== 113 && charCode !== 107 && charCode !== 112) {
      throw "Invalid character code to represent a chess piece: " + charCode;
    }
    return [color, String.fromCharCode(charCode)];
  };

  CMGPiece.prototype.toChar = function() {
    var out;
    out = this.type;
    if (this.color === 'w') {
      out = String.fromCharCode(this.type.charCodeAt(0) - 32);
    }
    return out;
  };

  return CMGPiece;

})();

module.exports = {
  position: CMGPosition,
  move: CMGMove
};
