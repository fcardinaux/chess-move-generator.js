/*
Chess Move Generator
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md
*/
var CMGMove, CMGPiece, CMGPosition;

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

  CMGPosition._shadow = function(square, direction) {
    return this.SHADOWS[square][direction];
  };

  CMGPosition._light = function(square, direction) {
    return this.SHADOWS[square][direction ^ 4];
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
    return true;
  };

  CMGPosition.prototype.allPossibleMovesFromSquare = function(squareKey) {
    var nonTakingMoves, out, piece, pseudoMove, pseudoMoves, shadowDirections, shadows, _i, _len;
    pseudoMoves = [];
    piece = this._getPieceOnSquare(squareKey);
    if (!piece) return [];
    if (piece.color !== this.turn) return [];
    switch (piece.type) {
      case 'r':
        shadows = this._computeShadows(squareKey, [0, 2, 4, 6], this.turn);
        pseudoMoves = CMGPosition.ROOK_MOVES[squareKey] & ~shadows;
        break;
      case 'n':
        pseudoMoves = CMGPosition.KNIGHT_MOVES[squareKey] & ~this.bitBoards.allPiecesOfColor[this.turn];
        break;
      case 'b':
        shadows = this._computeShadows(squareKey, [1, 3, 5, 7], this.turn);
        pseudoMoves = CMGPosition.BISHOP_MOVES[squareKey] & ~shadows;
        break;
      case 'q':
        shadows = this._computeShadows(squareKey, [0, 1, 2, 3, 4, 5, 6, 7], this.turn);
        pseudoMoves = CMGPosition.QUEEN_MOVES[squareKey] & ~shadows;
        break;
      case 'k':
        shadows = this._computeShadows(squareKey, [0, 1, 2, 3, 4, 5, 6, 7], this.turn);
        pseudoMoves = CMGPosition.KING_MOVES_WITHOUT_CASTLING[squareKey] & ~shadows;
        break;
      case 'p':
        if (this.turn === 'w') shadowDirections = [0];
        if (this.turn === 'b') shadowDirections = [4];
        shadows = this._computeShadows(squareKey, shadowDirections, this.turn);
        nonTakingMoves = CMGPosition.PAWN_NON_TAKING_MOVES[squareKey] & ~shadows;
        pseudoMoves = CMGPosition.PAWN_TAKING_MOVES[squareKey].concat(nonTakingMoves);
    }
    out = [];
    for (_i = 0, _len = pseudoMoves.length; _i < _len; _i++) {
      pseudoMove = pseudoMoves[_i];
      if (this._isValidMoveObject(pseudoMove)) out.push(pseudoMove);
    }
    return out;
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

  CMGPosition.prototype._isValidMoveObject = function(move) {
    var promotion;
    promotion = false;
    if (move.toPiece !== move.fromPiece) promotion = move.toPiece;
    return this.isValidMove(move.fromSquare, move.toSquare, promotion);
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
    this.bitBoards.allPiecesOfColor = 0x0;
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
      this.bitBoards.allPiecesOfColor[color] |= bvs;
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
    return CMGPosition._squareToString(fromSquare) + CMGPosition._squareToString(toSquare);
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
/* bitboards.js */
// Generated chess bitboards - copyright 2012 François Cardinaux, Genève
CMGPosition.QUEEN_MOVES = [[39623,15,34952,4680],[17899,32783,17476,292],[10877,18447,8738,18],[38206,9359,4369,1],[16927,39623,8,34952],[8463,17899,132,17476],[4111,10877,2114,8738],[15,38206,33825,4369],[44156,240,34953,9344],[24254,240,17476,4680],[42967,33008,8738,292],[21475,18680,4377,18],[8689,44156,132,34953],[4336,24254,2114,17476],[240,42967,33825,8738],[240,21475,16912,4377],[51146,3840,34970,18432],[60389,3840,17477,9344],[32122,3848,8746,4680],[15925,36740,4501,292],[7954,51146,2114,34970],[3841,60389,33825,17477],[3840,32122,16912,8746],[3840,15925,8448,4501],[31913,61440,35244,32768],[48724,61448,17502,18432],[55202,61572,8871,9344],[58201,63554,6483,4680],[61732,31913,33825,35244],[61458,48724,16912,17502],[61441,55202,8448,8871],[61440,58201,4096,6483],[51864,8,39623,15],[58692,132,17899,32783],[31266,2114,10877,18447],[13713,33825,38206,9359],[4680,51864,16927,39623],[292,58692,8463,17899],[18,31266,4111,10877],[1,13713,15,38206],[43400,132,44156,240],[21572,2114,24254,240],[41506,33825,42967,33008],[22801,16912,21475,18680],[9344,43400,8689,44156],[4680,21572,4336,24254],[292,41506,240,42967],[18,22801,240,21475],[39048,2114,51146,3840],[17476,33825,60389,3840],[8738,16912,32122,3848],[37137,8448,15925,36740],[18432,39048,7954,51146],[9344,17476,3841,60389],[4680,8738,3840,32122],[292,37137,3840,15925],[34952,33825,31913,61440],[17476,16912,48724,61448],[8738,8448,55202,61572],[4369,4096,58201,63554],[32768,34952,61732,31913],[18432,17476,61458,48724],[9344,8738,61441,55202],[4680,4369,61440,58201]];
CMGPosition.ROOK_MOVES = [[34951,15,34952,0],[17483,15,17476,0],[8749,15,8738,0],[4382,15,4369,0],[15,34951,0,34952],[15,17483,0,17476],[15,8749,0,8738],[15,4382,0,4369],[34936,240,34952,0],[17588,240,17476,0],[8914,240,8738,0],[4577,240,4369,0],[240,34936,0,34952],[240,17588,0,17476],[240,8914,0,8738],[240,4577,0,4369],[34696,3840,34952,0],[19268,3840,17476,0],[11554,3840,8738,0],[7697,3840,4369,0],[3840,34696,0,34952],[3840,19268,0,17476],[3840,11554,0,8738],[3840,7697,0,4369],[30856,61440,34952,0],[46148,61440,17476,0],[53794,61440,8738,0],[57617,61440,4369,0],[61440,30856,0,34952],[61440,46148,0,17476],[61440,53794,0,8738],[61440,57617,0,4369],[34952,0,34951,15],[17476,0,17483,15],[8738,0,8749,15],[4369,0,4382,15],[0,34952,15,34951],[0,17476,15,17483],[0,8738,15,8749],[0,4369,15,4382],[34952,0,34936,240],[17476,0,17588,240],[8738,0,8914,240],[4369,0,4577,240],[0,34952,240,34936],[0,17476,240,17588],[0,8738,240,8914],[0,4369,240,4577],[34952,0,34696,3840],[17476,0,19268,3840],[8738,0,11554,3840],[4369,0,7697,3840],[0,34952,3840,34696],[0,17476,3840,19268],[0,8738,3840,11554],[0,4369,3840,7697],[34952,0,30856,61440],[17476,0,46148,61440],[8738,0,53794,61440],[4369,0,57617,61440],[0,34952,61440,30856],[0,17476,61440,46148],[0,8738,61440,53794],[0,4369,61440,57617]];
CMGPosition.BISHOP_MOVES = [[4672,0,0,4680],[416,32768,0,292],[2128,18432,0,18],[33824,9344,0,1],[16912,4672,8,0],[8448,416,132,0],[4096,2128,2114,0],[0,33824,33825,0],[9220,0,1,9344],[6666,0,0,4680],[34053,32768,0,292],[16898,18440,8,18],[8449,9220,132,1],[4096,6666,2114,0],[0,34053,33825,0],[0,16898,16912,8],[16450,0,18,18432],[41121,0,1,9344],[20568,8,8,4680],[8228,32900,132,292],[4114,16450,2114,18],[1,41121,33825,1],[0,20568,16912,8],[0,8228,8448,132],[1057,0,292,32768],[2576,8,26,18432],[1408,132,133,9344],[584,2114,2114,4680],[292,1057,33825,292],[18,2576,16912,26],[1,1408,8448,133],[0,584,4096,2114],[16912,8,4672,0],[41216,132,416,32768],[22528,2114,2128,18432],[9344,33825,33824,9344],[4680,16912,16912,4672],[292,41216,8448,416],[18,22528,4096,2128],[1,9344,0,33824],[8448,132,9220,0],[4096,2114,6666,0],[32768,33825,34053,32768],[18432,16912,16898,18440],[9344,8448,8449,9220],[4680,4096,4096,6666],[292,32768,0,34053],[18,18432,0,16898],[4096,2114,16450,0],[0,33825,41121,0],[0,16912,20568,8],[32768,8448,8228,32900],[18432,4096,4114,16450],[9344,0,1,41121],[4680,0,0,20568],[292,32768,0,8228],[0,33825,1057,0],[0,16912,2576,8],[0,8448,1408,132],[0,4096,584,2114],[32768,0,292,1057],[18432,0,18,2576],[9344,0,1,1408],[4680,0,0,584]];
CMGPosition.KNIGHT_MOVES = [[1056,0,0,0],[2576,0,0,0],[1408,128,0,0],[576,2112,0,0],[288,1056,0,0],[16,2576,0,0],[0,1408,0,0],[0,576,0,0],[16898,0,0,0],[41217,0,0,0],[22536,2056,0,0],[9220,33796,0,0],[4610,16898,0,0],[257,41217,0,0],[0,22536,0,0],[0,9220,0,0],[8228,0,4,0],[4122,0,10,0],[32901,32896,5,0],[16450,16456,2,8],[8225,8228,1,4],[4112,4122,0,10],[0,32901,0,5],[0,16450,0,2],[576,0,66,0],[416,0,161,0],[2128,2048,88,8],[1056,1152,36,132],[528,576,18,66],[256,416,1,161],[0,2128,0,88],[0,1056,0,36],[9216,0,1056,0],[6656,0,2576,0],[34048,32768,1408,128],[16896,18432,576,2112],[8448,9216,288,1056],[4096,6656,16,2576],[0,34048,0,1408],[0,16896,0,576],[16384,0,16898,0],[40960,0,41217,0],[20480,0,22536,2056],[8192,32768,9220,33796],[4096,16384,4610,16898],[0,40960,257,41217],[0,20480,0,22536],[0,8192,0,9220],[0,0,8228,0],[0,0,4122,0],[0,0,32901,32896],[0,0,16450,16456],[0,0,8225,8228],[0,0,4112,4122],[0,0,0,32901],[0,0,0,16450],[0,0,576,0],[0,0,416,0],[0,0,2128,2048],[0,0,1056,1152],[0,0,528,576],[0,0,256,416],[0,0,0,2128],[0,0,0,1056]];
CMGPosition.KING_MOVES_WITHOUT_CASTLING = [[196,0,0,0],[234,0,0,0],[117,0,0,0],[50,136,0,0],[17,196,0,0],[0,234,0,0],[0,117,0,0],[0,50,0,0],[3148,0,0,0],[3758,0,0,0],[1879,0,0,0],[803,2184,0,0],[273,3148,0,0],[0,3758,0,0],[0,1879,0,0],[0,803,0,0],[50368,0,0,0],[60128,0,0,0],[30064,0,0,0],[12848,34944,0,0],[4368,50368,0,0],[0,60128,0,0],[0,30064,0,0],[0,12848,0,0],[19456,0,12,0],[44544,0,14,0],[22272,0,7,0],[8960,34816,3,8],[4352,19456,1,12],[0,44544,0,14],[0,22272,0,7],[0,8960,0,3],[49152,0,196,0],[57344,0,234,0],[28672,0,117,0],[12288,32768,50,136],[4096,49152,17,196],[0,57344,0,234],[0,28672,0,117],[0,12288,0,50],[0,0,3148,0],[0,0,3758,0],[0,0,1879,0],[0,0,803,2184],[0,0,273,3148],[0,0,0,3758],[0,0,0,1879],[0,0,0,803],[0,0,50368,0],[0,0,60128,0],[0,0,30064,0],[0,0,12848,34944],[0,0,4368,50368],[0,0,0,60128],[0,0,0,30064],[0,0,0,12848],[0,0,19456,0],[0,0,44544,0],[0,0,22272,0],[0,0,8960,34816],[0,0,4352,19456],[0,0,0,44544],[0,0,0,22272],[0,0,0,8960]];
CMGPosition.PAWN_NON_TAKING_MOVES = {
    b: [[2048,0,0,0],[1024,0,0,0],[512,0,0,0],[256,0,0,0],[0,2048,0,0],[0,1024,0,0],[0,512,0,0],[0,256,0,0],[32768,0,0,0],[16384,0,0,0],[8192,0,0,0],[4096,0,0,0],[0,32768,0,0],[0,16384,0,0],[0,8192,0,0],[0,4096,0,0],[0,0,8,0],[0,0,4,0],[0,0,2,0],[0,0,1,0],[0,0,0,8],[0,0,0,4],[0,0,0,2],[0,0,0,1],[0,0,128,0],[0,0,64,0],[0,0,32,0],[0,0,16,0],[0,0,0,128],[0,0,0,64],[0,0,0,32],[0,0,0,16],[0,0,2048,0],[0,0,1024,0],[0,0,512,0],[0,0,256,0],[0,0,0,2048],[0,0,0,1024],[0,0,0,512],[0,0,0,256],[0,0,136,0],[0,0,68,0],[0,0,34,0],[0,0,17,0],[0,0,0,136],[0,0,0,68],[0,0,0,34],[0,0,0,17]], 
    w: [[8,0,0,0],[4,0,0,0],[2,0,0,0],[1,0,0,0],[0,8,0,0],[0,4,0,0],[0,2,0,0],[0,1,0,0],[32768,0,0,0],[16384,0,0,0],[8192,0,0,0],[4096,0,0,0],[0,32768,0,0],[0,16384,0,0],[0,8192,0,0],[0,4096,0,0],[0,0,8,0],[0,0,4,0],[0,0,2,0],[0,0,1,0],[0,0,0,8],[0,0,0,4],[0,0,0,2],[0,0,0,1],[0,0,128,0],[0,0,64,0],[0,0,32,0],[0,0,16,0],[0,0,0,128],[0,0,0,64],[0,0,0,32],[0,0,0,16],[0,0,2048,0],[0,0,1024,0],[0,0,512,0],[0,0,256,0],[0,0,0,2048],[0,0,0,1024],[0,0,0,512],[0,0,0,256],[0,0,32768,0],[0,0,16384,0],[0,0,8192,0],[0,0,4096,0],[0,0,0,32768],[0,0,0,16384],[0,0,0,8192],[0,0,0,4096]]
};
CMGPosition.PAWN_TAKING_MOVES = {
    b: [[4,0,0,0],[10,0,0,0],[5,0,0,0],[2,8,0,0],[1,4,0,0],[0,10,0,0],[0,5,0,0],[0,2,0,0],[64,0,0,0],[160,0,0,0],[80,0,0,0],[32,128,0,0],[16,64,0,0],[0,160,0,0],[0,80,0,0],[0,32,0,0],[1024,0,0,0],[2560,0,0,0],[1280,0,0,0],[512,2048,0,0],[256,1024,0,0],[0,2560,0,0],[0,1280,0,0],[0,512,0,0],[16384,0,0,0],[40960,0,0,0],[20480,0,0,0],[8192,32768,0,0],[4096,16384,0,0],[0,40960,0,0],[0,20480,0,0],[0,8192,0,0],[0,0,4,0],[0,0,10,0],[0,0,5,0],[0,0,2,8],[0,0,1,4],[0,0,0,10],[0,0,0,5],[0,0,0,2],[0,0,64,0],[0,0,160,0],[0,0,80,0],[0,0,32,128],[0,0,16,64],[0,0,0,160],[0,0,0,80],[0,0,0,32]], 
    w: [[4,0,0,0],[10,0,0,0],[5,0,0,0],[2,8,0,0],[1,4,0,0],[0,10,0,0],[0,5,0,0],[0,2,0,0],[64,0,0,0],[160,0,0,0],[80,0,0,0],[32,128,0,0],[16,64,0,0],[0,160,0,0],[0,80,0,0],[0,32,0,0],[1024,0,0,0],[2560,0,0,0],[1280,0,0,0],[512,2048,0,0],[256,1024,0,0],[0,2560,0,0],[0,1280,0,0],[0,512,0,0],[16384,0,0,0],[40960,0,0,0],[20480,0,0,0],[8192,32768,0,0],[4096,16384,0,0],[0,40960,0,0],[0,20480,0,0],[0,8192,0,0],[0,0,4,0],[0,0,10,0],[0,0,5,0],[0,0,2,8],[0,0,1,4],[0,0,0,10],[0,0,0,5],[0,0,0,2],[0,0,64,0],[0,0,160,0],[0,0,80,0],[0,0,32,128],[0,0,16,64],[0,0,0,160],[0,0,0,80],[0,0,0,32]]
};
CMGPosition.SHADOWS = [[[34952,0,34952,0],[4680,0,0,4680],[15,15,0,0],[8,0,0,0],[8,0,0,0],[8,0,0,0],[8,0,0,0],[8,0,0,0]],[[17476,0,17476,0],[292,32768,0,292],[7,15,0,0],[4,0,0,0],[4,0,0,0],[4,0,0,0],[12,0,0,0],[132,0,0,0]],[[8738,0,8738,0],[18,18432,0,18],[3,15,0,0],[2,0,0,0],[2,0,0,0],[2,0,0,0],[14,0,0,0],[2114,0,0,0]],[[4369,0,4369,0],[1,9344,0,1],[1,15,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[15,0,0,0],[33825,0,0,0]],[[0,34952,0,34952],[0,4680,0,0],[0,15,0,0],[0,8,0,0],[0,8,0,0],[0,8,0,0],[15,8,0,0],[16912,8,8,0]],[[0,17476,0,17476],[0,292,0,0],[0,7,0,0],[0,4,0,0],[0,4,0,0],[0,4,0,0],[15,12,0,0],[8448,132,132,0]],[[0,8738,0,8738],[0,18,0,0],[0,3,0,0],[0,2,0,0],[0,2,0,0],[0,2,0,0],[15,14,0,0],[4096,2114,2114,0]],[[0,4369,0,4369],[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0],[15,15,0,0],[0,33825,33825,0]],[[34944,0,34952,0],[9344,0,1,9344],[240,240,0,0],[132,0,0,0],[136,0,0,0],[128,0,0,0],[128,0,0,0],[128,0,0,0]],[[17472,0,17476,0],[4672,0,0,4680],[112,240,0,0],[66,0,0,0],[68,0,0,0],[72,0,0,0],[192,0,0,0],[2112,0,0,0]],[[8736,0,8738,0],[288,32768,0,292],[48,240,0,0],[33,0,0,0],[34,0,0,0],[36,0,0,0],[224,0,0,0],[33824,0,0,0]],[[4368,0,4369,0],[16,18432,0,18],[16,240,0,0],[16,8,0,0],[17,0,0,0],[18,0,0,0],[240,0,0,0],[16912,0,8,0]],[[0,34944,0,34952],[0,9344,0,1],[0,240,0,0],[0,132,0,0],[0,136,0,0],[1,128,0,0],[240,128,0,0],[8448,128,132,0]],[[0,17472,0,17476],[0,4672,0,0],[0,112,0,0],[0,66,0,0],[0,68,0,0],[0,72,0,0],[240,192,0,0],[4096,2112,2114,0]],[[0,8736,0,8738],[0,288,0,0],[0,48,0,0],[0,33,0,0],[0,34,0,0],[0,36,0,0],[240,224,0,0],[0,33824,33825,0]],[[0,4368,0,4369],[0,16,0,0],[0,16,0,0],[0,16,0,0],[0,17,0,0],[0,18,0,0],[240,240,0,0],[0,16912,16912,8]],[[34816,0,34952,0],[18432,0,18,18432],[3840,3840,0,0],[2114,0,0,0],[2184,0,0,0],[2048,0,0,0],[2048,0,0,0],[2048,0,0,0]],[[17408,0,17476,0],[9216,0,1,9344],[1792,3840,0,0],[1057,0,0,0],[1092,0,0,0],[1152,0,0,0],[3072,0,0,0],[33792,0,0,0]],[[8704,0,8738,0],[4608,0,0,4680],[768,3840,0,0],[528,8,0,0],[546,0,0,0],[584,0,0,0],[3584,0,0,0],[16896,0,8,0]],[[4352,0,4369,0],[256,32768,0,292],[256,3840,0,0],[256,132,0,0],[273,0,0,0],[292,0,0,0],[3840,0,0,0],[8448,0,132,0]],[[0,34816,0,34952],[0,18432,0,18],[0,3840,0,0],[0,2114,0,0],[0,2184,0,0],[18,2048,0,0],[3840,2048,0,0],[4096,2048,2114,0]],[[0,17408,0,17476],[0,9216,0,1],[0,1792,0,0],[0,1057,0,0],[0,1092,0,0],[1,1152,0,0],[3840,3072,0,0],[0,33792,33825,0]],[[0,8704,0,8738],[0,4608,0,0],[0,768,0,0],[0,528,0,0],[0,546,0,0],[0,584,0,0],[3840,3584,0,0],[0,16896,16912,8]],[[0,4352,0,4369],[0,256,0,0],[0,256,0,0],[0,256,0,0],[0,273,0,0],[0,292,0,0],[3840,3840,0,0],[0,8448,8448,132]],[[32768,0,34952,0],[32768,0,292,32768],[61440,61440,0,0],[33825,0,0,0],[34952,0,0,0],[32768,0,0,0],[32768,0,0,0],[32768,0,0,0]],[[16384,0,17476,0],[16384,0,18,18432],[28672,61440,0,0],[16912,8,0,0],[17476,0,0,0],[18432,0,0,0],[49152,0,0,0],[16384,0,8,0]],[[8192,0,8738,0],[8192,0,1,9344],[12288,61440,0,0],[8448,132,0,0],[8738,0,0,0],[9344,0,0,0],[57344,0,0,0],[8192,0,132,0]],[[4096,0,4369,0],[4096,0,0,4680],[4096,61440,0,0],[4096,2114,0,0],[4369,0,0,0],[4680,0,0,0],[61440,0,0,0],[4096,0,2114,0]],[[0,32768,0,34952],[0,32768,0,292],[0,61440,0,0],[0,33825,0,0],[0,34952,0,0],[292,32768,0,0],[61440,32768,0,0],[0,32768,33825,0]],[[0,16384,0,17476],[0,16384,0,18],[0,28672,0,0],[0,16912,0,0],[0,17476,0,0],[18,18432,0,0],[61440,49152,0,0],[0,16384,16912,8]],[[0,8192,0,8738],[0,8192,0,1],[0,12288,0,0],[0,8448,0,0],[0,8738,0,0],[1,9344,0,0],[61440,57344,0,0],[0,8192,8448,132]],[[0,4096,0,4369],[0,4096,0,0],[0,4096,0,0],[0,4096,0,0],[0,4369,0,0],[0,4680,0,0],[61440,61440,0,0],[0,4096,4096,2114]],[[0,0,34952,0],[0,0,4680,0],[0,0,15,15],[16912,8,8,0],[34952,0,8,0],[0,0,8,0],[0,0,8,0],[0,0,8,0]],[[0,0,17476,0],[0,0,292,32768],[0,0,7,15],[8448,132,4,0],[17476,0,4,0],[32768,0,4,0],[0,0,12,0],[0,0,132,0]],[[0,0,8738,0],[0,0,18,18432],[0,0,3,15],[4096,2114,2,0],[8738,0,2,0],[18432,0,2,0],[0,0,14,0],[0,0,2114,0]],[[0,0,4369,0],[0,0,1,9344],[0,0,1,15],[0,33825,1,0],[4369,0,1,0],[9344,0,1,0],[0,0,15,0],[0,0,33825,0]],[[0,0,0,34952],[0,0,0,4680],[0,0,0,15],[0,16912,0,8],[0,34952,0,8],[4680,0,0,8],[0,0,15,8],[0,0,16912,8]],[[0,0,0,17476],[0,0,0,292],[0,0,0,7],[0,8448,0,4],[0,17476,0,4],[292,32768,0,4],[0,0,15,12],[0,0,8448,132]],[[0,0,0,8738],[0,0,0,18],[0,0,0,3],[0,4096,0,2],[0,8738,0,2],[18,18432,0,2],[0,0,15,14],[0,0,4096,2114]],[[0,0,0,4369],[0,0,0,1],[0,0,0,1],[0,0,0,1],[0,4369,0,1],[1,9344,0,1],[0,0,15,15],[0,0,0,33825]],[[0,0,34944,0],[0,0,9344,0],[0,0,240,240],[8448,132,132,0],[34952,0,136,0],[0,0,128,0],[0,0,128,0],[0,0,128,0]],[[0,0,17472,0],[0,0,4672,0],[0,0,112,240],[4096,2114,66,0],[17476,0,68,0],[0,0,72,0],[0,0,192,0],[0,0,2112,0]],[[0,0,8736,0],[0,0,288,32768],[0,0,48,240],[0,33825,33,0],[8738,0,34,0],[32768,0,36,0],[0,0,224,0],[0,0,33824,0]],[[0,0,4368,0],[0,0,16,18432],[0,0,16,240],[0,16912,16,8],[4369,0,17,0],[18432,0,18,0],[0,0,240,0],[0,0,16912,0]],[[0,0,0,34944],[0,0,0,9344],[0,0,0,240],[0,8448,0,132],[0,34952,0,136],[9344,0,1,128],[0,0,240,128],[0,0,8448,128]],[[0,0,0,17472],[0,0,0,4672],[0,0,0,112],[0,4096,0,66],[0,17476,0,68],[4680,0,0,72],[0,0,240,192],[0,0,4096,2112]],[[0,0,0,8736],[0,0,0,288],[0,0,0,48],[0,0,0,33],[0,8738,0,34],[292,32768,0,36],[0,0,240,224],[0,0,0,33824]],[[0,0,0,4368],[0,0,0,16],[0,0,0,16],[0,0,0,16],[0,4369,0,17],[18,18432,0,18],[0,0,240,240],[0,0,0,16912]],[[0,0,34816,0],[0,0,18432,0],[0,0,3840,3840],[4096,2114,2114,0],[34952,0,2184,0],[0,0,2048,0],[0,0,2048,0],[0,0,2048,0]],[[0,0,17408,0],[0,0,9216,0],[0,0,1792,3840],[0,33825,1057,0],[17476,0,1092,0],[0,0,1152,0],[0,0,3072,0],[0,0,33792,0]],[[0,0,8704,0],[0,0,4608,0],[0,0,768,3840],[0,16912,528,8],[8738,0,546,0],[0,0,584,0],[0,0,3584,0],[0,0,16896,0]],[[0,0,4352,0],[0,0,256,32768],[0,0,256,3840],[0,8448,256,132],[4369,0,273,0],[32768,0,292,0],[0,0,3840,0],[0,0,8448,0]],[[0,0,0,34816],[0,0,0,18432],[0,0,0,3840],[0,4096,0,2114],[0,34952,0,2184],[18432,0,18,2048],[0,0,3840,2048],[0,0,4096,2048]],[[0,0,0,17408],[0,0,0,9216],[0,0,0,1792],[0,0,0,1057],[0,17476,0,1092],[9344,0,1,1152],[0,0,3840,3072],[0,0,0,33792]],[[0,0,0,8704],[0,0,0,4608],[0,0,0,768],[0,0,0,528],[0,8738,0,546],[4680,0,0,584],[0,0,3840,3584],[0,0,0,16896]],[[0,0,0,4352],[0,0,0,256],[0,0,0,256],[0,0,0,256],[0,4369,0,273],[292,32768,0,292],[0,0,3840,3840],[0,0,0,8448]],[[0,0,32768,0],[0,0,32768,0],[0,0,61440,61440],[0,33825,33825,0],[34952,0,34952,0],[0,0,32768,0],[0,0,32768,0],[0,0,32768,0]],[[0,0,16384,0],[0,0,16384,0],[0,0,28672,61440],[0,16912,16912,8],[17476,0,17476,0],[0,0,18432,0],[0,0,49152,0],[0,0,16384,0]],[[0,0,8192,0],[0,0,8192,0],[0,0,12288,61440],[0,8448,8448,132],[8738,0,8738,0],[0,0,9344,0],[0,0,57344,0],[0,0,8192,0]],[[0,0,4096,0],[0,0,4096,0],[0,0,4096,61440],[0,4096,4096,2114],[4369,0,4369,0],[0,0,4680,0],[0,0,61440,0],[0,0,4096,0]],[[0,0,0,32768],[0,0,0,32768],[0,0,0,61440],[0,0,0,33825],[0,34952,0,34952],[32768,0,292,32768],[0,0,61440,32768],[0,0,0,32768]],[[0,0,0,16384],[0,0,0,16384],[0,0,0,28672],[0,0,0,16912],[0,17476,0,17476],[18432,0,18,18432],[0,0,61440,49152],[0,0,0,16384]],[[0,0,0,8192],[0,0,0,8192],[0,0,0,12288],[0,0,0,8448],[0,8738,0,8738],[9344,0,1,9344],[0,0,61440,57344],[0,0,0,8192]],[[0,0,0,4096],[0,0,0,4096],[0,0,0,4096],[0,0,0,4096],[0,4369,0,4369],[4680,0,0,4680],[0,0,61440,61440],[0,0,0,4096]]];
