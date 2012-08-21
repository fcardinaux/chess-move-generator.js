/*
Chess Move Generator
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md
*/
var CMGBitBoard, CMGMove, CMGPiece, CMGPosition, CMGUtil, clg;

clg = (function() {

  function clg() {}

  clg.opened = false;

  clg.open = function(val) {
    if (val == null) val = true;
    return this.opened = val;
  };

  clg.close = function() {
    return this.opened = false;
  };

  clg.log = function(x, isBitBoard) {
    if (isBitBoard == null) isBitBoard = false;
    if (!this.opened) return;
    if (isBitBoard) {
      return this._logBitBoard(x);
    } else {
      return console.log(x);
    }
  };

  clg._logBitBoard = function(bb) {
    /*
            For debugging
    */
    var bit, line, lines, quadrant, quadrantKey, text, val, _i, _len;
    console.log(JSON.stringify(bb) + ':');
    console.log('+--------+');
    val = ['.', 'x'];
    for (quadrantKey = 3; quadrantKey >= 0; quadrantKey--) {
      quadrant = bb[quadrantKey];
      lines = [];
      lines[0] = Math.floor(quadrant / 256);
      lines[1] = quadrant % 256;
      for (_i = 0, _len = lines.length; _i < _len; _i++) {
        line = lines[_i];
        text = '';
        for (bit = 0; bit <= 7; bit++) {
          text += val[line % 2];
          line = Math.floor(line / 2);
        }
        console.log('|' + text + '|');
      }
    }
    return console.log('+--------+');
  };

  return clg;

})();

CMGBitBoard = (function() {

  function CMGBitBoard() {}

  CMGBitBoard.EMPTY_BOARD = [0, 0, 0, 0];

  CMGBitBoard.FULL_BOARD = [0xffff, 0xffff, 0xffff, 0xffff];

  CMGBitBoard.binEqual = function(bb1, bb2) {
    var quadrantId;
    for (quadrantId = 0; quadrantId <= 3; quadrantId++) {
      if (bb1[quadrantId] !== bb2[quadrantId]) return false;
    }
    return true;
  };

  CMGBitBoard.isZero = function(bb) {
    return this.binEqual(bb, this.EMPTY_BOARD);
  };

  CMGBitBoard.binAnd = function(bb1, bb2) {
    return [bb1[0] & bb2[0], bb1[1] & bb2[1], bb1[2] & bb2[2], bb1[3] & bb2[3]];
  };

  CMGBitBoard.binOr = function(bb1, bb2) {
    return [bb1[0] | bb2[0], bb1[1] | bb2[1], bb1[2] | bb2[2], bb1[3] | bb2[3]];
  };

  CMGBitBoard.binXor = function(bb1, bb2) {
    return [bb1[0] ^ bb2[0], bb1[1] ^ bb2[1], bb1[2] ^ bb2[2], bb1[3] ^ bb2[3]];
  };

  CMGBitBoard.binNot = function(bb) {
    return [~bb[0] & 0xffff, ~bb[1] & 0xffff, ~bb[2] & 0xffff, ~bb[3] & 0xffff];
  };

  CMGBitBoard.valueOfSquare = function(square) {
    return this.SQUARE_VALUES[square];
  };

  CMGBitBoard.binLeftShift = function(bb, n) {
    var carry, qKey, res, shiftedBb;
    res = [];
    while (n >= 16) {
      bb[3] = bb[2];
      bb[2] = bb[1];
      bb[1] = bb[0];
      bb[0] = 0;
      n -= 16;
    }
    carry = 0;
    for (qKey = 0; qKey <= 3; qKey++) {
      shiftedBb = (bb[qKey] << n) + carry;
      res[qKey] = shiftedBb & 0xffff;
      carry = shiftedBb >> 16;
    }
    return res;
  };

  CMGBitBoard.bitBoardToSquareKeyArray = function(bitBoard) {
    var key, qid, quadrant, squareKeys, _len;
    squareKeys = [];
    for (qid = 0, _len = bitBoard.length; qid < _len; qid++) {
      quadrant = bitBoard[qid];
      for (key = 0; key <= 15; key++) {
        if ((1 << key) & quadrant) squareKeys.push(qid * 16 + key);
      }
    }
    return squareKeys;
  };

  return CMGBitBoard;

})();

CMGPosition = (function() {

  CMGPosition.PSEUDO_ONLY = false;

  CMGPosition.ROW_SPAN = 8;

  CMGPosition.BOTTOM_LEFT_CORNER = 0;

  CMGPosition.BOTTOM_RIGHT_CORNER = 7;

  CMGPosition.TOP_LEFT_CORNER = 070;

  CMGPosition.TOP_RIGHT_CORNER = 077;

  CMGPosition.CASTLING_CODE_ALL = 15;

  CMGPosition.CASTLING_CODE_WHITE_KING = 8;

  CMGPosition.CASTLING_CODE_WHITE_QUEEN = 4;

  CMGPosition.CASTLING_CODE_BLACK_KING = 2;

  CMGPosition.CASTLING_CODE_BLACK_QUEEN = 1;

  CMGPosition.CASTLING_WHITE_KING = {
    move: [64, 0, 0, 0],
    mustBeEmpty: [96, 0, 0, 0]
  };

  CMGPosition.CASTLING_WHITE_QUEEN = {
    move: [4, 0, 0, 0],
    mustBeEmpty: [14, 0, 0, 0]
  };

  CMGPosition.CASTLING_BLACK_KING = {
    move: [0, 0, 0, 16384],
    mustBeEmpty: [0, 0, 0, 24576]
  };

  CMGPosition.CASTLING_BLACK_QUEEN = {
    move: [0, 0, 0, 1024],
    mustBeEmpty: [0, 0, 0, 3584]
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
    if (allowedCastlingString === '-') return 0;
    func = function(acc, pce) {
      switch (pce) {
        case 'K':
          return acc + CMGPosition.CASTLING_CODE_WHITE_KING;
        case 'Q':
          return acc + CMGPosition.CASTLING_CODE_WHITE_QUEEN;
        case 'k':
          return acc + CMGPosition.CASTLING_CODE_BLACK_KING;
        case 'q':
          return acc + CMGPosition.CASTLING_CODE_BLACK_QUEEN;
      }
      return acc;
    };
    return allowedCastlingString.split('').reduce(func, 0);
  };

  CMGPosition._allowedCastlingValueToString = function(allowedCastling) {
    var allowedCastlingString, bkChar, bqChar, wkChar, wqChar;
    if (allowedCastling === 0) return '-';
    wqChar = wkChar = bqChar = bkChar = '';
    if (allowedCastling & CMGPosition.CASTLING_CODE_WHITE_QUEEN) wqChar = 'Q';
    if (allowedCastling & CMGPosition.CASTLING_CODE_WHITE_KING) wkChar = 'K';
    if (allowedCastling & CMGPosition.CASTLING_CODE_BLACK_QUEEN) bqChar = 'q';
    if (allowedCastling & CMGPosition.CASTLING_CODE_BLACK_KING) bkChar = 'k';
    allowedCastlingString = [wkChar, wqChar, bkChar, bqChar].join('');
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

  CMGPosition._shadow = function(square, direction) {
    return this.SHADOWS[square][direction];
  };

  CMGPosition._light = function(square, direction) {
    return this.SHADOWS[square][direction ^ 4];
  };

  CMGPosition._oppositeColor = function(color, defaultValue) {
    if (defaultValue == null) defaultValue = false;
    switch (color) {
      case "b":
        return "w";
      case "w":
        return "b";
    }
    return defaultValue;
  };

  CMGPosition.squareNumberToString = function(squareNumber) {
    var colValue, rowValue;
    rowValue = Math.floor(squareNumber / CMGPosition.ROW_SPAN);
    colValue = squareNumber % CMGPosition.ROW_SPAN;
    return String.fromCharCode(colValue + 97) + String.fromCharCode(rowValue + 49);
  };

  function CMGPosition(pieces, turn, allowedCastling, enPassantSquare, halfMoveClock, moveNumber) {
    var piece, squareId, _ref;
    this.pieces = pieces;
    this.turn = turn;
    this.allowedCastling = allowedCastling != null ? allowedCastling : 0;
    this.enPassantSquare = enPassantSquare != null ? enPassantSquare : false;
    this.halfMoveClock = halfMoveClock != null ? halfMoveClock : 0;
    this.moveNumber = moveNumber != null ? moveNumber : 0;
    /*
            Constructor
            @param pieces (Object) With object keys = square ids and object values = instances of CMGPiece
            @param turn (false|"b"|"w")
            @param allowedCastling (integer)
            @param enPassantSquare (false|integer where integer is between 0 (bottom right corner) and 077 (top right corner)
            @param halfMoveClock (integer)
            @param moveNumber (integer)
    */
    this.piecesOfColor = {
      b: {},
      w: {}
    };
    if (this.pieces) {
      _ref = this.pieces;
      for (squareId in _ref) {
        piece = _ref[squareId];
        this.piecesOfColor[piece.color][squareId] = piece;
      }
    }
    this.bitBoards = {};
    this._generateBitBoards();
  }

  CMGPosition.prototype.playerColorCode = function() {
    return this.turn;
  };

  CMGPosition.prototype.opponentColorCode = function() {
    return CMGPosition._oppositeColor(this.turn);
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
    var castling, move, newPiece, newPieceType, out, piece, pseudoMove, pseudoMoveBitBoard, pseudoMoves, takenOnSquare, takenPiece, target, targets, toPiece, _i, _j, _k, _len, _len2, _len3, _ref;
    squareKey = CMGUtil.toString(squareKey);
    piece = this._getPieceOnSquare(squareKey);
    if (!piece) return 0x0;
    if (piece.color !== this.turn) return 0x0;
    pseudoMoveBitBoard = this._bitBoardOfPseudoMovesFromSquare(squareKey, piece, this.turn, this.opponentColorCode());
    pseudoMoves = [];
    targets = CMGBitBoard.bitBoardToSquareKeyArray(pseudoMoveBitBoard);
    for (_i = 0, _len = targets.length; _i < _len; _i++) {
      target = targets[_i];
      toPiece = piece;
      takenPiece = this._getPieceOnSquare(target);
      takenOnSquare = false;
      if (takenPiece) takenOnSquare = target;
      if (piece.type === 'p' && (target >= CMGPosition.TOP_LEFT_CORNER || target <= CMGPosition.BOTTOM_RIGHT_CORNER)) {
        _ref = ['q', 'r', 'n', 'b'];
        for (_j = 0, _len2 = _ref.length; _j < _len2; _j++) {
          newPieceType = _ref[_j];
          newPiece = new CMGPiece(piece.color, newPieceType);
          move = new CMGMove(squareKey, piece, target, newPiece, null, false, takenPiece, takenOnSquare);
          move.setNewPositionObject(this._getNewPositionObjectAfterMove(move));
          pseudoMoves.push(move);
        }
      } else {
        castling = false;
        if (piece.type === 'k' && Math.abs(target - squareKey) === 2) {
          if (target > squareKey) {
            castling = 'k';
          } else {
            castling = 'q';
          }
        }
        move = new CMGMove(squareKey, piece, target, toPiece, null, castling, takenPiece, takenOnSquare);
        move.setNewPositionObject(this._getNewPositionObjectAfterMove(move));
        pseudoMoves.push(move);
      }
    }
    out = [];
    for (_k = 0, _len3 = pseudoMoves.length; _k < _len3; _k++) {
      pseudoMove = pseudoMoves[_k];
      if (this._isValidMoveObject(pseudoMove)) out.push(pseudoMove);
    }
    return out;
  };

  CMGPosition.prototype._getNewPositionObjectAfterMove = function(move) {
    var allowedCastling, enPassantSquare, halfMoveClock, moveNumber, pawnJump, pieces, turn;
    pieces = CMGUtil.cloneObject(this.pieces);
    pieces[move.fromSquare] = null;
    delete pieces[move.fromSquare];
    if (move.takenOnSquare) {
      pieces[move.takenOnSquare] = null;
      delete pieces[move.takenOnSquare];
    }
    pieces[move.toSquare] = move.toPiece;
    if (move.castling === 'k') {
      if (this.turn === 'b') {
        pieces[075] = pieces[077];
        delete pieces[077];
      }
      if (this.turn === 'w') {
        pieces[5] = pieces[7];
        delete pieces[7];
      }
    } else if (move.castling === 'q') {
      if (this.turn === 'b') {
        pieces[073] = pieces[070];
        delete pieces[070];
      }
      if (this.turn === 'w') {
        pieces[3] = pieces[0];
        delete pieces[0];
      }
    }
    turn = this.opponentColorCode();
    allowedCastling = this.allowedCastling;
    switch (parseInt(move.fromSquare)) {
      case 0:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_WHITE_QUEEN;
        break;
      case 4:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_WHITE_QUEEN & ~CMGPosition.CASTLING_CODE_WHITE_KING;
        break;
      case 7:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_WHITE_KING;
        break;
      case 070:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN;
        break;
      case 074:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN & ~CMGPosition.CASTLING_CODE_BLACK_KING;
        break;
      case 077:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_KING;
    }
    if (move.takenOnSquare !== false && move.takenPiece.type === 'r') {
      switch (parseInt(move.takenOnSquare)) {
        case 0:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_WHITE_QUEEN;
          break;
        case 4:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_WHITE_QUEEN & ~CMGPosition.CASTLING_CODE_WHITE_KING;
          break;
        case 7:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_WHITE_KING;
          break;
        case 070:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN;
          break;
        case 074:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN & ~CMGPosition.CASTLING_CODE_BLACK_KING;
          break;
        case 077:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_KING;
      }
    }
    enPassantSquare = false;
    if (move.fromPiece.type === 'p') {
      pawnJump = move.toSquare - move.fromSquare;
      if (Math.abs(pawnJump) === 16) {
        enPassantSquare = move.toSquare - pawnJump / 2;
      }
    }
    halfMoveClock = this.halfMoveClock;
    moveNumber = this.moveNumber;
    if (moveNumber === 0) {
      halfMoveClock = 0;
    } else {
      if (turn === 'w') moveNumber += 1;
      if (move.fromPiece.type === 'p') {
        halfMoveClock = 0;
      } else if (move.takenPiece) {
        halfMoveClock = 0;
      } else {
        halfMoveClock += 1;
      }
    }
    return new CMGPosition(pieces, turn, allowedCastling, enPassantSquare, halfMoveClock, moveNumber);
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

  CMGPosition.prototype._bitBoardOfPseudoMoves = function(stopAtColor, stopAfterColor) {
    var out, piece, pieceSquare, _ref;
    if (stopAtColor == null) stopAtColor = false;
    if (stopAfterColor == null) stopAfterColor = false;
    out = CMGBitBoard.EMPTY_BOARD;
    _ref = this.piecesOfColor[this.turn];
    for (pieceSquare in _ref) {
      piece = _ref[pieceSquare];
      out = CMGBitBoard.binOr(out, this._bitBoardOfPseudoMovesFromSquare(pieceSquare, piece, stopAtColor, stopAfterColor));
    }
    return out;
  };

  CMGPosition.prototype._bitBoardOfPseudoMovesFromSquare = function(squareKey, movedPiece, stopAtColor, stopAfterColor) {
    var allShadows, nonTakingMoves, out, pawnMoveArrayKey, shadowDirections, shadows, takingMoves;
    if (stopAtColor == null) stopAtColor = false;
    if (stopAfterColor == null) stopAfterColor = false;
    out = CMGBitBoard.EMPTY_BOARD;
    if (!movedPiece) return CMGBitBoard.EMPTY_BOARD;
    switch (movedPiece.type) {
      case 'r':
        shadows = this._computeShadows(squareKey, [0, 2, 4, 6], stopAtColor, stopAfterColor);
        out = CMGBitBoard.binAnd(CMGPosition.ROOK_MOVES[squareKey], CMGBitBoard.binNot(shadows));
        break;
      case 'n':
        out = CMGBitBoard.binAnd(CMGPosition.KNIGHT_MOVES[squareKey], CMGBitBoard.binNot(this.bitBoards.allPiecesOfColor[this.turn]));
        break;
      case 'b':
        shadows = this._computeShadows(squareKey, [1, 3, 5, 7], stopAtColor, stopAfterColor);
        out = CMGBitBoard.binAnd(CMGPosition.BISHOP_MOVES[squareKey], CMGBitBoard.binNot(shadows));
        break;
      case 'q':
        shadows = this._computeShadows(squareKey, [0, 1, 2, 3, 4, 5, 6, 7], stopAtColor, stopAfterColor);
        out = CMGBitBoard.binAnd(CMGPosition.QUEEN_MOVES[squareKey], CMGBitBoard.binNot(shadows));
        break;
      case 'k':
        shadows = this._computeShadows(squareKey, [0, 1, 2, 3, 4, 5, 6, 7], stopAtColor, stopAfterColor);
        out = CMGBitBoard.binAnd(CMGPosition.KING_MOVES_WITHOUT_CASTLING[squareKey], CMGBitBoard.binNot(shadows));
        if (movedPiece.color === 'b') {
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_BLACK_KING) && CMGBitBoard.isZero(CMGBitBoard.binAnd(this.bitBoards.allPieces, CMGPosition.CASTLING_BLACK_KING.mustBeEmpty))) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_BLACK_KING.move);
          }
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_BLACK_QUEEN) && CMGBitBoard.isZero(CMGBitBoard.binAnd(this.bitBoards.allPieces, CMGPosition.CASTLING_BLACK_QUEEN.mustBeEmpty))) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_BLACK_QUEEN.move);
          }
        } else {
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_WHITE_KING) && CMGBitBoard.isZero(CMGBitBoard.binAnd(this.bitBoards.allPieces, CMGPosition.CASTLING_WHITE_KING.mustBeEmpty))) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_WHITE_KING.move);
          }
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_WHITE_QUEEN) && CMGBitBoard.isZero(CMGBitBoard.binAnd(this.bitBoards.allPieces, CMGPosition.CASTLING_WHITE_QUEEN.mustBeEmpty))) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_WHITE_QUEEN.move);
          }
        }
        break;
      case 'p':
        if (this.turn === 'w') shadowDirections = [0];
        if (this.turn === 'b') shadowDirections = [4];
        allShadows = this._computeShadows(squareKey, shadowDirections, '*');
        pawnMoveArrayKey = squareKey - 8;
        nonTakingMoves = CMGBitBoard.binAnd(CMGPosition.PAWN_NON_TAKING_MOVES[this.turn][pawnMoveArrayKey], CMGBitBoard.binNot(allShadows));
        takingMoves = CMGBitBoard.binAnd(CMGPosition.PAWN_TAKING_MOVES[this.turn][pawnMoveArrayKey], CMGBitBoard.binNot(this.bitBoards.allPiecesOfColor[this.turn]));
        out = CMGBitBoard.binOr(takingMoves, nonTakingMoves);
    }
    return out;
  };

  CMGPosition.prototype._computeShadows = function(squareKey, directions, stopAtColor, stopAfterColor) {
    var shadowMap;
    if (stopAtColor == null) stopAtColor = '*';
    if (stopAfterColor == null) stopAfterColor = false;
    shadowMap = CMGBitBoard.EMPTY_BOARD;
    if (stopAtColor) {
      shadowMap = CMGBitBoard.binOr(shadowMap, this._computeSingleBehaviorShadows(squareKey, directions, stopAtColor, false));
    }
    if (stopAfterColor) {
      shadowMap = CMGBitBoard.binOr(shadowMap, this._computeSingleBehaviorShadows(squareKey, directions, stopAfterColor, true));
    }
    return shadowMap;
  };

  CMGPosition.prototype._computeSingleBehaviorShadows = function(squareKey, directions, stoppingColor, stopAfterOnly) {
    var direction, exclusionMap, newShadows, piece, pieceSquare, pieceSquareBitBoard, pieces, shadowMap, squareKeyBitBoard, _i, _len;
    if (stoppingColor == null) stoppingColor = '*';
    if (stopAfterOnly == null) stopAfterOnly = false;
    shadowMap = CMGBitBoard.EMPTY_BOARD;
    pieces = null;
    if (stoppingColor === '*') {
      pieces = this.pieces;
    } else {
      pieces = this.piecesOfColor[stoppingColor];
    }
    squareKeyBitBoard = CMGBitBoard.valueOfSquare(squareKey);
    for (pieceSquare in pieces) {
      piece = pieces[pieceSquare];
      if (pieceSquare === squareKey) continue;
      exclusionMap = false;
      if (stopAfterOnly) {
        pieceSquareBitBoard = CMGBitBoard.valueOfSquare(pieceSquare);
        exclusionMap = CMGBitBoard.binNot(pieceSquareBitBoard);
      }
      for (_i = 0, _len = directions.length; _i < _len; _i++) {
        direction = directions[_i];
        if (!CMGBitBoard.isZero(CMGBitBoard.binAnd(CMGPosition._light(pieceSquare, direction), squareKeyBitBoard))) {
          newShadows = CMGPosition._shadow(pieceSquare, direction);
          if (exclusionMap) {
            newShadows = CMGBitBoard.binAnd(newShadows, exclusionMap);
          }
          shadowMap = CMGBitBoard.binOr(shadowMap, newShadows);
          break;
        }
      }
    }
    return shadowMap;
  };

  CMGPosition.prototype._isValidMoveObject = function(move) {
    /*
            Is the pseudo move a valid move:
            * pawn taking moves where nothing can be taken (verify also en passant)
            * move after which the king is under chess
            * castling moves that cross a threatened square
    */
    var crossedSquare, crossedSquareAttackBitBoard, crossedSquareBitBoard, delta, kingAttackBitBoard, kingBitBoard, pseudoThreatsOnPlayerAfterMove;
    if (move.fromPiece.type === 'p' && (Math.abs(move.toSquare - move.fromSquare) % 8) !== 0 && move.takenPiece === false) {
      return CMGPosition.PSEUDO_ONLY;
    }
    pseudoThreatsOnPlayerAfterMove = move.newPosition._bitBoardOfPseudoMoves(this.opponentColorCode(), this.turn);
    kingBitBoard = move.newPosition.bitBoards.allPiecesOfColorAndType[this.turn]['k'];
    kingAttackBitBoard = CMGBitBoard.binAnd(kingBitBoard, pseudoThreatsOnPlayerAfterMove);
    if (!CMGBitBoard.binEqual(kingAttackBitBoard, CMGBitBoard.EMPTY_BOARD)) {
      return CMGPosition.PSEUDO_ONLY;
    }
    if (move.fromPiece.type === 'k') {
      delta = parseInt(move.toSquare) - parseInt(move.fromSquare);
      if (Math.abs(delta) === 2) {
        crossedSquare = parseInt(move.fromSquare) + delta / 2;
        crossedSquareBitBoard = CMGBitBoard.valueOfSquare(crossedSquare);
        crossedSquareAttackBitBoard = CMGBitBoard.binAnd(crossedSquareBitBoard, pseudoThreatsOnPlayerAfterMove);
        if (!CMGBitBoard.binEqual(crossedSquareAttackBitBoard, CMGBitBoard.EMPTY_BOARD)) {
          return CMGPosition.PSEUDO_ONLY;
        }
      }
    }
    return true;
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
    return CMGPosition.squareNumberToString(squareNumber);
  };

  CMGPosition.prototype._getPieceOnSquare = function(squareKey) {
    return CMGPosition._getPieceOnSquare(this.pieces, squareKey);
  };

  CMGPosition.prototype._generateBitBoards = function() {
    var bvs, color, square, type, _ref, _ref2, _results;
    this.bitBoards.allPieces = CMGBitBoard.EMPTY_BOARD;
    this.bitBoards.allPiecesOfColor = {
      'b': CMGBitBoard.EMPTY_BOARD,
      'w': CMGBitBoard.EMPTY_BOARD
    };
    this.bitBoards.allPiecesOfColorAndType = {
      'b': {
        'r': CMGBitBoard.EMPTY_BOARD,
        'n': CMGBitBoard.EMPTY_BOARD,
        'b': CMGBitBoard.EMPTY_BOARD,
        'k': CMGBitBoard.EMPTY_BOARD,
        'q': CMGBitBoard.EMPTY_BOARD,
        'p': CMGBitBoard.EMPTY_BOARD
      },
      'w': {
        'r': CMGBitBoard.EMPTY_BOARD,
        'n': CMGBitBoard.EMPTY_BOARD,
        'b': CMGBitBoard.EMPTY_BOARD,
        'k': CMGBitBoard.EMPTY_BOARD,
        'q': CMGBitBoard.EMPTY_BOARD,
        'p': CMGBitBoard.EMPTY_BOARD
      }
    };
    _ref = this.pieces;
    _results = [];
    for (square in _ref) {
      _ref2 = _ref[square], color = _ref2.color, type = _ref2.type;
      bvs = CMGBitBoard.valueOfSquare(square);
      this.bitBoards.allPieces = CMGBitBoard.binOr(bvs, this.bitBoards.allPieces);
      this.bitBoards.allPiecesOfColor[color] = CMGBitBoard.binOr(bvs, this.bitBoards.allPiecesOfColor[color]);
      _results.push(this.bitBoards.allPiecesOfColorAndType[color][type] = CMGBitBoard.binOr(bvs, this.bitBoards.allPiecesOfColorAndType[color][type]));
    }
    return _results;
  };

  return CMGPosition;

})();

CMGMove = (function() {

  CMGMove.fromStringAndPosition = function(moveString, oldPosition) {
    var fromSquare, promotion, toString;
    fromSquare = moveString.substr(0, 2);
    toString = moveString.substr(2, 2);
    promotion = false;
    if (moveString.length === 5) return promotion = moveString.substr(4);
  };

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
    this.fromSquare = CMGUtil.toString(this.fromSquare);
    this.toSquare = CMGUtil.toString(this.toSquare);
    this.takenOnSquare = CMGUtil.toString(this.takenOnSquare);
  }

  CMGMove.prototype.toString = function() {
    var out;
    out = CMGPosition.squareNumberToString(this.fromSquare) + CMGPosition.squareNumberToString(this.toSquare);
    if (this.fromPiece.type === 'p' && this.toPiece.type !== 'p') {
      out += this.toPiece.type.toUpperCase();
    }
    return out;
  };

  CMGMove.prototype.setNewPositionObject = function(newPosition) {
    this.newPosition = newPosition;
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
      console.log("Invalid character code to represent a chess piece: " + charCode);
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

CMGUtil = (function() {

  function CMGUtil() {}

  CMGUtil.cloneObject = function(obj) {
    /*
            Function to clone an object
    
            Source: http://keithdevens.com/weblog/archive/2007/Jun/07/javascript.clone
    */
    var key, out, value;
    if (obj === null || typeof obj !== 'object') return obj;
    out = new obj.constructor();
    for (key in obj) {
      value = obj[key];
      out[key] = this.cloneObject(value);
    }
    return out;
  };

  CMGUtil.toString = function(value) {
    if (typeof value !== 'string') return '' + value;
    return value;
  };

  return CMGUtil;

})();

module.exports = {
  bitBoard: CMGBitBoard,
  position: CMGPosition,
  move: CMGMove
};
/* bitboards.js */
// Generated chess bitboards - copyright 2012 François Cardinaux, Genève
CMGPosition.QUEEN_MOVES = [[1022,2309,8465,33089],[2045,4618,16930,642],[3835,9237,33860,1028],[7415,18730,2184,2056],[14575,37460,4113,4112],[28895,9384,8482,8224],[57535,18512,16964,16449],[49279,37024,33928,33154],[65027,1283,4361,16673],[64775,2567,8722,33346],[64270,5390,17444,1156],[63260,10780,34889,2056],[61240,21560,4498,4112],[57200,43120,8740,8225],[49120,20704,17480,16706],[32704,41152,34960,33412],[773,1022,2309,8465],[1802,2045,4618,16930],[3605,3835,9237,33860],[7210,7415,18730,2184],[14420,14575,37460,4113],[28840,28895,9384,8482],[57424,57535,18512,16964],[49312,49279,37024,33928],[1289,65027,1283,4361],[2578,64775,2567,8722],[5412,64270,5390,17444],[10825,63260,10780,34889],[21650,61240,21560,4498],[43044,57200,43120,8740],[20552,49120,20704,17480],[41104,32704,41152,34960],[2321,773,1022,2309],[4642,1802,2045,4618],[9284,3605,3835,9237],[18824,7210,7415,18730],[37393,14420,14575,37460],[9250,28840,28895,9384],[18500,57424,57535,18512],[37000,49312,49279,37024],[4385,1289,65027,1283],[8770,2578,64775,2567],[17540,5412,64270,5390],[34824,10825,63260,10780],[4368,21650,61240,21560],[8737,43044,57200,43120],[17474,20552,49120,20704],[34948,41104,32704,41152],[8513,2321,773,1022],[17026,4642,1802,2045],[33796,9284,3605,3835],[2056,18824,7210,7415],[4112,37393,14420,14575],[8480,9250,28840,28895],[16961,18500,57424,57535],[33922,37000,49312,49279],[16769,4385,1289,65027],[33282,8770,2578,64775],[1028,17540,5412,64270],[2056,34824,10825,63260],[4112,4368,21650,61240],[8224,8737,43044,57200],[16704,17474,20552,49120],[33409,34948,41104,32704]];
CMGPosition.ROOK_MOVES = [[510,257,257,257],[765,514,514,514],[1275,1028,1028,1028],[2295,2056,2056,2056],[4335,4112,4112,4112],[8415,8224,8224,8224],[16575,16448,16448,16448],[32895,32896,32896,32896],[65025,257,257,257],[64770,514,514,514],[64260,1028,1028,1028],[63240,2056,2056,2056],[61200,4112,4112,4112],[57120,8224,8224,8224],[48960,16448,16448,16448],[32640,32896,32896,32896],[257,510,257,257],[514,765,514,514],[1028,1275,1028,1028],[2056,2295,2056,2056],[4112,4335,4112,4112],[8224,8415,8224,8224],[16448,16575,16448,16448],[32896,32895,32896,32896],[257,65025,257,257],[514,64770,514,514],[1028,64260,1028,1028],[2056,63240,2056,2056],[4112,61200,4112,4112],[8224,57120,8224,8224],[16448,48960,16448,16448],[32896,32640,32896,32896],[257,257,510,257],[514,514,765,514],[1028,1028,1275,1028],[2056,2056,2295,2056],[4112,4112,4335,4112],[8224,8224,8415,8224],[16448,16448,16575,16448],[32896,32896,32895,32896],[257,257,65025,257],[514,514,64770,514],[1028,1028,64260,1028],[2056,2056,63240,2056],[4112,4112,61200,4112],[8224,8224,57120,8224],[16448,16448,48960,16448],[32896,32896,32640,32896],[257,257,257,510],[514,514,514,765],[1028,1028,1028,1275],[2056,2056,2056,2295],[4112,4112,4112,4335],[8224,8224,8224,8415],[16448,16448,16448,16575],[32896,32896,32896,32895],[257,257,257,65025],[514,514,514,64770],[1028,1028,1028,64260],[2056,2056,2056,63240],[4112,4112,4112,61200],[8224,8224,8224,57120],[16448,16448,16448,48960],[32896,32896,32896,32640]];
CMGPosition.BISHOP_MOVES = [[512,2052,8208,32832],[1280,4104,16416,128],[2560,8209,32832,0],[5120,16674,128,0],[10240,33348,1,0],[20480,1160,258,0],[40960,2064,516,1],[16384,4128,1032,258],[2,1026,4104,16416],[5,2053,8208,32832],[10,4362,16416,128],[20,8724,32833,0],[40,17448,386,0],[80,34896,516,1],[160,4256,1032,258],[64,8256,2064,516],[516,512,2052,8208],[1288,1280,4104,16416],[2577,2560,8209,32832],[5154,5120,16674,128],[10308,10240,33348,1],[20616,20480,1160,258],[40976,40960,2064,516],[16416,16384,4128,1032],[1032,2,1026,4104],[2064,5,2053,8208],[4384,10,4362,16416],[8769,20,8724,32833],[17538,40,17448,386],[34820,80,34896,516],[4104,160,4256,1032],[8208,64,8256,2064],[2064,516,512,2052],[4128,1288,1280,4104],[8256,2577,2560,8209],[16768,5154,5120,16674],[33281,10308,10240,33348],[1026,20616,20480,1160],[2052,40976,40960,2064],[4104,16416,16384,4128],[4128,1032,2,1026],[8256,2064,5,2053],[16512,4384,10,4362],[32768,8769,20,8724],[256,17538,40,17448],[513,34820,80,34896],[1026,4104,160,4256],[2052,8208,64,8256],[8256,2064,516,512],[16512,4128,1288,1280],[32768,8256,2577,2560],[0,16768,5154,5120],[0,33281,10308,10240],[256,1026,20616,20480],[513,2052,40976,40960],[1026,4104,16416,16384],[16512,4128,1032,2],[32768,8256,2064,5],[0,16512,4384,10],[0,32768,8769,20],[0,256,17538,40],[0,513,34820,80],[256,1026,4104,160],[513,2052,8208,64]];
CMGPosition.KNIGHT_MOVES = [[1024,2,0,0],[2048,5,0,0],[4352,10,0,0],[8704,20,0,0],[17408,40,0,0],[34816,80,0,0],[4096,160,0,0],[8192,64,0,0],[4,516,0,0],[8,1288,0,0],[17,2577,0,0],[34,5154,0,0],[68,10308,0,0],[136,20616,0,0],[16,40976,0,0],[32,16416,0,0],[1026,1024,2,0],[2053,2048,5,0],[4362,4352,10,0],[8724,8704,20,0],[17448,17408,40,0],[34896,34816,80,0],[4256,4096,160,0],[8256,8192,64,0],[512,4,516,0],[1280,8,1288,0],[2560,17,2577,0],[5120,34,5154,0],[10240,68,10308,0],[20480,136,20616,0],[40960,16,40976,0],[16384,32,16416,0],[0,1026,1024,2],[0,2053,2048,5],[0,4362,4352,10],[0,8724,8704,20],[0,17448,17408,40],[0,34896,34816,80],[0,4256,4096,160],[0,8256,8192,64],[0,512,4,516],[0,1280,8,1288],[0,2560,17,2577],[0,5120,34,5154],[0,10240,68,10308],[0,20480,136,20616],[0,40960,16,40976],[0,16384,32,16416],[0,0,1026,1024],[0,0,2053,2048],[0,0,4362,4352],[0,0,8724,8704],[0,0,17448,17408],[0,0,34896,34816],[0,0,4256,4096],[0,0,8256,8192],[0,0,512,4],[0,0,1280,8],[0,0,2560,17],[0,0,5120,34],[0,0,10240,68],[0,0,20480,136],[0,0,40960,16],[0,0,16384,32]];
CMGPosition.KING_MOVES_WITHOUT_CASTLING = [[770,0,0,0],[1797,0,0,0],[3594,0,0,0],[7188,0,0,0],[14376,0,0,0],[28752,0,0,0],[57504,0,0,0],[49216,0,0,0],[515,3,0,0],[1287,7,0,0],[2574,14,0,0],[5148,28,0,0],[10296,56,0,0],[20592,112,0,0],[41184,224,0,0],[16576,192,0,0],[768,770,0,0],[1792,1797,0,0],[3584,3594,0,0],[7168,7188,0,0],[14336,14376,0,0],[28672,28752,0,0],[57344,57504,0,0],[49152,49216,0,0],[0,515,3,0],[0,1287,7,0],[0,2574,14,0],[0,5148,28,0],[0,10296,56,0],[0,20592,112,0],[0,41184,224,0],[0,16576,192,0],[0,768,770,0],[0,1792,1797,0],[0,3584,3594,0],[0,7168,7188,0],[0,14336,14376,0],[0,28672,28752,0],[0,57344,57504,0],[0,49152,49216,0],[0,0,515,3],[0,0,1287,7],[0,0,2574,14],[0,0,5148,28],[0,0,10296,56],[0,0,20592,112],[0,0,41184,224],[0,0,16576,192],[0,0,768,770],[0,0,1792,1797],[0,0,3584,3594],[0,0,7168,7188],[0,0,14336,14376],[0,0,28672,28752],[0,0,57344,57504],[0,0,49152,49216],[0,0,0,515],[0,0,0,1287],[0,0,0,2574],[0,0,0,5148],[0,0,0,10296],[0,0,0,20592],[0,0,0,41184],[0,0,0,16576]];
CMGPosition.PAWN_NON_TAKING_MOVES = {
    b: [[1,0,0,0],[2,0,0,0],[4,0,0,0],[8,0,0,0],[16,0,0,0],[32,0,0,0],[64,0,0,0],[128,0,0,0],[256,0,0,0],[512,0,0,0],[1024,0,0,0],[2048,0,0,0],[4096,0,0,0],[8192,0,0,0],[16384,0,0,0],[32768,0,0,0],[0,1,0,0],[0,2,0,0],[0,4,0,0],[0,8,0,0],[0,16,0,0],[0,32,0,0],[0,64,0,0],[0,128,0,0],[0,256,0,0],[0,512,0,0],[0,1024,0,0],[0,2048,0,0],[0,4096,0,0],[0,8192,0,0],[0,16384,0,0],[0,32768,0,0],[0,0,1,0],[0,0,2,0],[0,0,4,0],[0,0,8,0],[0,0,16,0],[0,0,32,0],[0,0,64,0],[0,0,128,0],[0,0,257,0],[0,0,514,0],[0,0,1028,0],[0,0,2056,0],[0,0,4112,0],[0,0,8224,0],[0,0,16448,0],[0,0,32896,0]], 
    w: [[0,257,0,0],[0,514,0,0],[0,1028,0,0],[0,2056,0,0],[0,4112,0,0],[0,8224,0,0],[0,16448,0,0],[0,32896,0,0],[0,256,0,0],[0,512,0,0],[0,1024,0,0],[0,2048,0,0],[0,4096,0,0],[0,8192,0,0],[0,16384,0,0],[0,32768,0,0],[0,0,1,0],[0,0,2,0],[0,0,4,0],[0,0,8,0],[0,0,16,0],[0,0,32,0],[0,0,64,0],[0,0,128,0],[0,0,256,0],[0,0,512,0],[0,0,1024,0],[0,0,2048,0],[0,0,4096,0],[0,0,8192,0],[0,0,16384,0],[0,0,32768,0],[0,0,0,1],[0,0,0,2],[0,0,0,4],[0,0,0,8],[0,0,0,16],[0,0,0,32],[0,0,0,64],[0,0,0,128],[0,0,0,256],[0,0,0,512],[0,0,0,1024],[0,0,0,2048],[0,0,0,4096],[0,0,0,8192],[0,0,0,16384],[0,0,0,32768]]
};
CMGPosition.PAWN_TAKING_MOVES = {
    b: [[2,0,0,0],[5,0,0,0],[10,0,0,0],[20,0,0,0],[40,0,0,0],[80,0,0,0],[160,0,0,0],[64,0,0,0],[512,0,0,0],[1280,0,0,0],[2560,0,0,0],[5120,0,0,0],[10240,0,0,0],[20480,0,0,0],[40960,0,0,0],[16384,0,0,0],[0,2,0,0],[0,5,0,0],[0,10,0,0],[0,20,0,0],[0,40,0,0],[0,80,0,0],[0,160,0,0],[0,64,0,0],[0,512,0,0],[0,1280,0,0],[0,2560,0,0],[0,5120,0,0],[0,10240,0,0],[0,20480,0,0],[0,40960,0,0],[0,16384,0,0],[0,0,2,0],[0,0,5,0],[0,0,10,0],[0,0,20,0],[0,0,40,0],[0,0,80,0],[0,0,160,0],[0,0,64,0],[0,0,512,0],[0,0,1280,0],[0,0,2560,0],[0,0,5120,0],[0,0,10240,0],[0,0,20480,0],[0,0,40960,0],[0,0,16384,0]], 
    w: [[0,2,0,0],[0,5,0,0],[0,10,0,0],[0,20,0,0],[0,40,0,0],[0,80,0,0],[0,160,0,0],[0,64,0,0],[0,512,0,0],[0,1280,0,0],[0,2560,0,0],[0,5120,0,0],[0,10240,0,0],[0,20480,0,0],[0,40960,0,0],[0,16384,0,0],[0,0,2,0],[0,0,5,0],[0,0,10,0],[0,0,20,0],[0,0,40,0],[0,0,80,0],[0,0,160,0],[0,0,64,0],[0,0,512,0],[0,0,1280,0],[0,0,2560,0],[0,0,5120,0],[0,0,10240,0],[0,0,20480,0],[0,0,40960,0],[0,0,16384,0],[0,0,0,2],[0,0,0,5],[0,0,0,10],[0,0,0,20],[0,0,0,40],[0,0,0,80],[0,0,0,160],[0,0,0,64],[0,0,0,512],[0,0,0,1280],[0,0,0,2560],[0,0,0,5120],[0,0,0,10240],[0,0,0,20480],[0,0,0,40960],[0,0,0,16384]]
};
CMGPosition.SHADOWS = [[[257,257,257,257],[513,2052,8208,32832],[255,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0],[1,0,0,0]],[[514,514,514,514],[1026,4104,16416,128],[254,0,0,0],[2,0,0,0],[2,0,0,0],[2,0,0,0],[3,0,0,0],[258,0,0,0]],[[1028,1028,1028,1028],[2052,8208,32832,0],[252,0,0,0],[4,0,0,0],[4,0,0,0],[4,0,0,0],[7,0,0,0],[516,1,0,0]],[[2056,2056,2056,2056],[4104,16416,128,0],[248,0,0,0],[8,0,0,0],[8,0,0,0],[8,0,0,0],[15,0,0,0],[1032,258,0,0]],[[4112,4112,4112,4112],[8208,32832,0,0],[240,0,0,0],[16,0,0,0],[16,0,0,0],[16,0,0,0],[31,0,0,0],[2064,516,1,0]],[[8224,8224,8224,8224],[16416,128,0,0],[224,0,0,0],[32,0,0,0],[32,0,0,0],[32,0,0,0],[63,0,0,0],[4128,1032,258,0]],[[16448,16448,16448,16448],[32832,0,0,0],[192,0,0,0],[64,0,0,0],[64,0,0,0],[64,0,0,0],[127,0,0,0],[8256,2064,516,1]],[[32896,32896,32896,32896],[128,0,0,0],[128,0,0,0],[128,0,0,0],[128,0,0,0],[128,0,0,0],[255,0,0,0],[16512,4128,1032,258]],[[256,257,257,257],[256,1026,4104,16416],[65280,0,0,0],[258,0,0,0],[257,0,0,0],[256,0,0,0],[256,0,0,0],[256,0,0,0]],[[512,514,514,514],[512,2052,8208,32832],[65024,0,0,0],[516,0,0,0],[514,0,0,0],[513,0,0,0],[768,0,0,0],[512,1,0,0]],[[1024,1028,1028,1028],[1024,4104,16416,128],[64512,0,0,0],[1032,0,0,0],[1028,0,0,0],[1026,0,0,0],[1792,0,0,0],[1024,258,0,0]],[[2048,2056,2056,2056],[2048,8208,32832,0],[63488,0,0,0],[2064,0,0,0],[2056,0,0,0],[2052,0,0,0],[3840,0,0,0],[2048,516,1,0]],[[4096,4112,4112,4112],[4096,16416,128,0],[61440,0,0,0],[4128,0,0,0],[4112,0,0,0],[4104,0,0,0],[7936,0,0,0],[4096,1032,258,0]],[[8192,8224,8224,8224],[8192,32832,0,0],[57344,0,0,0],[8256,0,0,0],[8224,0,0,0],[8208,0,0,0],[16128,0,0,0],[8192,2064,516,1]],[[16384,16448,16448,16448],[16384,128,0,0],[49152,0,0,0],[16512,0,0,0],[16448,0,0,0],[16416,0,0,0],[32512,0,0,0],[16384,4128,1032,258]],[[32768,32896,32896,32896],[32768,0,0,0],[32768,0,0,0],[32768,0,0,0],[32896,0,0,0],[32832,0,0,0],[65280,0,0,0],[32768,8256,2064,516]],[[0,257,257,257],[0,513,2052,8208],[0,255,0,0],[516,1,0,0],[257,1,0,0],[0,1,0,0],[0,1,0,0],[0,1,0,0]],[[0,514,514,514],[0,1026,4104,16416],[0,254,0,0],[1032,2,0,0],[514,2,0,0],[256,2,0,0],[0,3,0,0],[0,258,0,0]],[[0,1028,1028,1028],[0,2052,8208,32832],[0,252,0,0],[2064,4,0,0],[1028,4,0,0],[513,4,0,0],[0,7,0,0],[0,516,1,0]],[[0,2056,2056,2056],[0,4104,16416,128],[0,248,0,0],[4128,8,0,0],[2056,8,0,0],[1026,8,0,0],[0,15,0,0],[0,1032,258,0]],[[0,4112,4112,4112],[0,8208,32832,0],[0,240,0,0],[8256,16,0,0],[4112,16,0,0],[2052,16,0,0],[0,31,0,0],[0,2064,516,1]],[[0,8224,8224,8224],[0,16416,128,0],[0,224,0,0],[16512,32,0,0],[8224,32,0,0],[4104,32,0,0],[0,63,0,0],[0,4128,1032,258]],[[0,16448,16448,16448],[0,32832,0,0],[0,192,0,0],[32768,64,0,0],[16448,64,0,0],[8208,64,0,0],[0,127,0,0],[0,8256,2064,516]],[[0,32896,32896,32896],[0,128,0,0],[0,128,0,0],[0,128,0,0],[32896,128,0,0],[16416,128,0,0],[0,255,0,0],[0,16512,4128,1032]],[[0,256,257,257],[0,256,1026,4104],[0,65280,0,0],[1032,258,0,0],[257,257,0,0],[0,256,0,0],[0,256,0,0],[0,256,0,0]],[[0,512,514,514],[0,512,2052,8208],[0,65024,0,0],[2064,516,0,0],[514,514,0,0],[0,513,0,0],[0,768,0,0],[0,512,1,0]],[[0,1024,1028,1028],[0,1024,4104,16416],[0,64512,0,0],[4128,1032,0,0],[1028,1028,0,0],[256,1026,0,0],[0,1792,0,0],[0,1024,258,0]],[[0,2048,2056,2056],[0,2048,8208,32832],[0,63488,0,0],[8256,2064,0,0],[2056,2056,0,0],[513,2052,0,0],[0,3840,0,0],[0,2048,516,1]],[[0,4096,4112,4112],[0,4096,16416,128],[0,61440,0,0],[16512,4128,0,0],[4112,4112,0,0],[1026,4104,0,0],[0,7936,0,0],[0,4096,1032,258]],[[0,8192,8224,8224],[0,8192,32832,0],[0,57344,0,0],[32768,8256,0,0],[8224,8224,0,0],[2052,8208,0,0],[0,16128,0,0],[0,8192,2064,516]],[[0,16384,16448,16448],[0,16384,128,0],[0,49152,0,0],[0,16512,0,0],[16448,16448,0,0],[4104,16416,0,0],[0,32512,0,0],[0,16384,4128,1032]],[[0,32768,32896,32896],[0,32768,0,0],[0,32768,0,0],[0,32768,0,0],[32896,32896,0,0],[8208,32832,0,0],[0,65280,0,0],[0,32768,8256,2064]],[[0,0,257,257],[0,0,513,2052],[0,0,255,0],[2064,516,1,0],[257,257,1,0],[0,0,1,0],[0,0,1,0],[0,0,1,0]],[[0,0,514,514],[0,0,1026,4104],[0,0,254,0],[4128,1032,2,0],[514,514,2,0],[0,256,2,0],[0,0,3,0],[0,0,258,0]],[[0,0,1028,1028],[0,0,2052,8208],[0,0,252,0],[8256,2064,4,0],[1028,1028,4,0],[0,513,4,0],[0,0,7,0],[0,0,516,1]],[[0,0,2056,2056],[0,0,4104,16416],[0,0,248,0],[16512,4128,8,0],[2056,2056,8,0],[256,1026,8,0],[0,0,15,0],[0,0,1032,258]],[[0,0,4112,4112],[0,0,8208,32832],[0,0,240,0],[32768,8256,16,0],[4112,4112,16,0],[513,2052,16,0],[0,0,31,0],[0,0,2064,516]],[[0,0,8224,8224],[0,0,16416,128],[0,0,224,0],[0,16512,32,0],[8224,8224,32,0],[1026,4104,32,0],[0,0,63,0],[0,0,4128,1032]],[[0,0,16448,16448],[0,0,32832,0],[0,0,192,0],[0,32768,64,0],[16448,16448,64,0],[2052,8208,64,0],[0,0,127,0],[0,0,8256,2064]],[[0,0,32896,32896],[0,0,128,0],[0,0,128,0],[0,0,128,0],[32896,32896,128,0],[4104,16416,128,0],[0,0,255,0],[0,0,16512,4128]],[[0,0,256,257],[0,0,256,1026],[0,0,65280,0],[4128,1032,258,0],[257,257,257,0],[0,0,256,0],[0,0,256,0],[0,0,256,0]],[[0,0,512,514],[0,0,512,2052],[0,0,65024,0],[8256,2064,516,0],[514,514,514,0],[0,0,513,0],[0,0,768,0],[0,0,512,1]],[[0,0,1024,1028],[0,0,1024,4104],[0,0,64512,0],[16512,4128,1032,0],[1028,1028,1028,0],[0,256,1026,0],[0,0,1792,0],[0,0,1024,258]],[[0,0,2048,2056],[0,0,2048,8208],[0,0,63488,0],[32768,8256,2064,0],[2056,2056,2056,0],[0,513,2052,0],[0,0,3840,0],[0,0,2048,516]],[[0,0,4096,4112],[0,0,4096,16416],[0,0,61440,0],[0,16512,4128,0],[4112,4112,4112,0],[256,1026,4104,0],[0,0,7936,0],[0,0,4096,1032]],[[0,0,8192,8224],[0,0,8192,32832],[0,0,57344,0],[0,32768,8256,0],[8224,8224,8224,0],[513,2052,8208,0],[0,0,16128,0],[0,0,8192,2064]],[[0,0,16384,16448],[0,0,16384,128],[0,0,49152,0],[0,0,16512,0],[16448,16448,16448,0],[1026,4104,16416,0],[0,0,32512,0],[0,0,16384,4128]],[[0,0,32768,32896],[0,0,32768,0],[0,0,32768,0],[0,0,32768,0],[32896,32896,32896,0],[2052,8208,32832,0],[0,0,65280,0],[0,0,32768,8256]],[[0,0,0,257],[0,0,0,513],[0,0,0,255],[8256,2064,516,1],[257,257,257,1],[0,0,0,1],[0,0,0,1],[0,0,0,1]],[[0,0,0,514],[0,0,0,1026],[0,0,0,254],[16512,4128,1032,2],[514,514,514,2],[0,0,256,2],[0,0,0,3],[0,0,0,258]],[[0,0,0,1028],[0,0,0,2052],[0,0,0,252],[32768,8256,2064,4],[1028,1028,1028,4],[0,0,513,4],[0,0,0,7],[0,0,0,516]],[[0,0,0,2056],[0,0,0,4104],[0,0,0,248],[0,16512,4128,8],[2056,2056,2056,8],[0,256,1026,8],[0,0,0,15],[0,0,0,1032]],[[0,0,0,4112],[0,0,0,8208],[0,0,0,240],[0,32768,8256,16],[4112,4112,4112,16],[0,513,2052,16],[0,0,0,31],[0,0,0,2064]],[[0,0,0,8224],[0,0,0,16416],[0,0,0,224],[0,0,16512,32],[8224,8224,8224,32],[256,1026,4104,32],[0,0,0,63],[0,0,0,4128]],[[0,0,0,16448],[0,0,0,32832],[0,0,0,192],[0,0,32768,64],[16448,16448,16448,64],[513,2052,8208,64],[0,0,0,127],[0,0,0,8256]],[[0,0,0,32896],[0,0,0,128],[0,0,0,128],[0,0,0,128],[32896,32896,32896,128],[1026,4104,16416,128],[0,0,0,255],[0,0,0,16512]],[[0,0,0,256],[0,0,0,256],[0,0,0,65280],[16512,4128,1032,258],[257,257,257,257],[0,0,0,256],[0,0,0,256],[0,0,0,256]],[[0,0,0,512],[0,0,0,512],[0,0,0,65024],[32768,8256,2064,516],[514,514,514,514],[0,0,0,513],[0,0,0,768],[0,0,0,512]],[[0,0,0,1024],[0,0,0,1024],[0,0,0,64512],[0,16512,4128,1032],[1028,1028,1028,1028],[0,0,256,1026],[0,0,0,1792],[0,0,0,1024]],[[0,0,0,2048],[0,0,0,2048],[0,0,0,63488],[0,32768,8256,2064],[2056,2056,2056,2056],[0,0,513,2052],[0,0,0,3840],[0,0,0,2048]],[[0,0,0,4096],[0,0,0,4096],[0,0,0,61440],[0,0,16512,4128],[4112,4112,4112,4112],[0,256,1026,4104],[0,0,0,7936],[0,0,0,4096]],[[0,0,0,8192],[0,0,0,8192],[0,0,0,57344],[0,0,32768,8256],[8224,8224,8224,8224],[0,513,2052,8208],[0,0,0,16128],[0,0,0,8192]],[[0,0,0,16384],[0,0,0,16384],[0,0,0,49152],[0,0,0,16512],[16448,16448,16448,16448],[256,1026,4104,16416],[0,0,0,32512],[0,0,0,16384]],[[0,0,0,32768],[0,0,0,32768],[0,0,0,32768],[0,0,0,32768],[32896,32896,32896,32896],[513,2052,8208,32832],[0,0,0,65280],[0,0,0,32768]]];
CMGBitBoard.SQUARE_VALUES = [
    [1,0,0,0],
    [2,0,0,0],
    [4,0,0,0],
    [8,0,0,0],
    [16,0,0,0],
    [32,0,0,0],
    [64,0,0,0],
    [128,0,0,0],
    [256,0,0,0],
    [512,0,0,0],
    [1024,0,0,0],
    [2048,0,0,0],
    [4096,0,0,0],
    [8192,0,0,0],
    [16384,0,0,0],
    [32768,0,0,0],
    [0,1,0,0],
    [0,2,0,0],
    [0,4,0,0],
    [0,8,0,0],
    [0,16,0,0],
    [0,32,0,0],
    [0,64,0,0],
    [0,128,0,0],
    [0,256,0,0],
    [0,512,0,0],
    [0,1024,0,0],
    [0,2048,0,0],
    [0,4096,0,0],
    [0,8192,0,0],
    [0,16384,0,0],
    [0,32768,0,0],
    [0,0,1,0],
    [0,0,2,0],
    [0,0,4,0],
    [0,0,8,0],
    [0,0,16,0],
    [0,0,32,0],
    [0,0,64,0],
    [0,0,128,0],
    [0,0,256,0],
    [0,0,512,0],
    [0,0,1024,0],
    [0,0,2048,0],
    [0,0,4096,0],
    [0,0,8192,0],
    [0,0,16384,0],
    [0,0,32768,0],
    [0,0,0,1],
    [0,0,0,2],
    [0,0,0,4],
    [0,0,0,8],
    [0,0,0,16],
    [0,0,0,32],
    [0,0,0,64],
    [0,0,0,128],
    [0,0,0,256],
    [0,0,0,512],
    [0,0,0,1024],
    [0,0,0,2048],
    [0,0,0,4096],
    [0,0,0,8192],
    [0,0,0,16384],
    [0,0,0,32768],
];
