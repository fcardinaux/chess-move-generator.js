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

The board and the square codes:
    * decimal value
    * octal value

    +-----+-----+-----+-----+-----+-----+-----+-----+
   8| 112 | 113 | 114 | 115 | 116 | 117 | 118 | 119 |
    | 160 | 161 | 162 | 163 | 164 | 165 | 166 | 167 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   7|  96 |  97 |  98 |  99 | 100 | 101 | 102 | 103 |
    | 140 | 141 | 142 | 143 | 144 | 145 | 146 | 147 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   6|  80 |  81 |  82 |  83 |  84 |  85 |  86 |  87 |
    | 120 | 121 | 122 | 123 | 124 | 125 | 126 | 127 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   5|  64 |  65 |  66 |  67 |  68 |  69 |  70 |  71 |
    | 100 | 101 | 102 | 103 | 104 | 105 | 106 | 107 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   4|  48 |  49 |  50 |  51 |  52 |  53 |  54 |  55 |
    |  60 |  61 |  62 |  63 |  64 |  65 |  66 |  67 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   3|  32 |  33 |  34 |  35 |  36 |  37 |  38 |  39 |
    |  40 |  41 |  42 |  43 |  44 |  45 |  46 |  47 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   2|  16 |  17 |  18 |  19 |  20 |  21 |  22 |  23 |
    |  20 |  21 |  22 |  23 |  24 |  25 |  26 |  27 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
   1|   0 |   1 |   2 |   3 |   4 |   5 |   6 |   7 |
    |   0 |   1 |   2 |   3 |   4 |   5 |   6 |   7 |
    +-----+-----+-----+-----+-----+-----+-----+-----+
       A     B     C     D     E     F     G     H
*/
var CMGMove, CMGPiece, CMGPosition;

CMGPosition = (function() {

  CMGPosition.ROW_SPAN = 16;

  CMGPosition.MOVE_UP = 16;

  CMGPosition.MOVE_UP_LEFT = 15;

  CMGPosition.MOVE_UP_RIGHT = 17;

  CMGPosition.MOVE_UP_2 = 32;

  CMGPosition.MOVE_DOWN = -16;

  CMGPosition.MOVE_DOWN_LEFT = -17;

  CMGPosition.MOVE_DOWN_RIGHT = -15;

  CMGPosition.MOVE_DOWN_2 = -32;

  CMGPosition.BOTTOM_LEFT_CORNER = 0;

  CMGPosition.BOTTOM_RIGHT_CORNER = 7;

  CMGPosition.TOP_LEFT_CORNER = 112;

  CMGPosition.TOP_RIGHT_CORNER = 119;

  CMGPosition.CASTLING_ALL = 15;

  CMGPosition.CASTLING_WHITE_KING = 8;

  CMGPosition.CASTLING_WHITE_QUEEN = 4;

  CMGPosition.CASTLING_BLACK_KING = 2;

  CMGPosition.CASTLING_BLACK_QUEEN = 1;

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
            @param pieces ([CMGPieceOnSquare])
            @param turn (false|"b"|"w")
            @param allowedCastling (integer)
            @param enPassantSquare (false|integer where integer is between 0 (bottom right corner) an 119 (top right corner in 0x88 representation)
            @param halfMoveClock (integer)
            @param moveNumber (integer)
    */
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

  return CMGPosition;

})();

CMGMove = (function() {

  function CMGMove(from, to, newPosition, castling, taken) {
    this.from = from;
    this.to = to;
    this.newPosition = newPosition;
    this.castling = castling != null ? castling : false;
    this.taken = taken != null ? taken : false;
    /*
            Constructor
            @param from (CMGPieceOnSquare)
            @param to (CMGPieceOnSquare)
            @param newPosition (CMGPosition)
            @param castling (false|"queen"|"king")
            @param taken (false|CMGPieceOnSquare)
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
