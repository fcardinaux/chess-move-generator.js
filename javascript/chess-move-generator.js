/*
Chess Move Generator
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md

Things to be aware of when using clojure compiler's advanced optimization
=========================================================================

Read https://developers.google.com/closure/compiler/docs/api-tutorial3#dangers

In particular:
* When accessing an object's element, always use the same method: either myObject['myKey'] or myObject.myKey
* Observe the way the NoCompile is created and used to export the symbols that must be kept after clojure compiler's advanced optimization
*/
var CMGBitBoard, CMGMove, CMGPiece, CMGPosition, CMGUtil, NoCompile;

CMGBitBoard = (function() {

  function CMGBitBoard() {}

  CMGBitBoard.clone = function(bb) {
    return [bb[0], bb[1], bb[2], bb[3]];
  };

  CMGBitBoard.binEqual = function(bb1, bb2) {
    var quadrantId;
    for (quadrantId = 0; quadrantId <= 3; quadrantId++) {
      if (bb1[quadrantId] !== bb2[quadrantId]) return false;
    }
    return true;
  };

  CMGBitBoard.boolNand = function(bb1, bb2) {
    return (0 === (bb1[0] & bb2[0])) && (0 === (bb1[1] & bb2[1])) && (0 === (bb1[2] & bb2[2])) && (0 === (bb1[3] & bb2[3]));
  };

  CMGBitBoard.binAnd = function(bb1, bb2) {
    return [bb1[0] & bb2[0], bb1[1] & bb2[1], bb1[2] & bb2[2], bb1[3] & bb2[3]];
  };

  CMGBitBoard.binOr = function(bb1, bb2) {
    return [bb1[0] | bb2[0], bb1[1] | bb2[1], bb1[2] | bb2[2], bb1[3] | bb2[3]];
  };

  CMGBitBoard.binNot = function(bb) {
    return [~bb[0] & 0xffff, ~bb[1] & 0xffff, ~bb[2] & 0xffff, ~bb[3] & 0xffff];
  };

  CMGBitBoard.valueOfSquare = function(square) {
    return this.SQUARE_VALUES[square];
  };

  CMGBitBoard.quadrantAndValueOfSquare = function(square) {
    var quadrant, value;
    square = parseInt(square);
    quadrant = Math.floor(square / 16);
    value = 1 << (square % 16);
    return [quadrant, value];
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

  CMGPosition.TOP_LEFT_CORNER = 56;

  CMGPosition.TOP_RIGHT_CORNER = 63;

  CMGPosition.CASTLING_CODE_ALL = 15;

  CMGPosition.CASTLING_CODE_WHITE_KING = 8;

  CMGPosition.CASTLING_CODE_WHITE_QUEEN = 4;

  CMGPosition.CASTLING_CODE_BLACK_KING = 2;

  CMGPosition.CASTLING_CODE_BLACK_QUEEN = 1;

  CMGPosition.CASTLING_CODE_ANY_KING = CMGPosition.CASTLING_CODE_WHITE_KING | CMGPosition.CASTLING_CODE_BLACK_KING;

  CMGPosition.CASTLING_CODE_ANY_QUEEN = CMGPosition.CASTLING_CODE_WHITE_QUEEN | CMGPosition.CASTLING_CODE_BLACK_QUEEN;

  CMGPosition.CASTLING_WHITE_KING = {
    move: [64, 0, 0, 0],
    mustBeEmptyOnQuadrant0: 96
  };

  CMGPosition.CASTLING_WHITE_QUEEN = {
    move: [4, 0, 0, 0],
    mustBeEmptyOnQuadrant0: 14
  };

  CMGPosition.CASTLING_BLACK_KING = {
    move: [0, 0, 0, 16384],
    mustBeEmptyOnQuadrant3: 24576
  };

  CMGPosition.CASTLING_BLACK_QUEEN = {
    move: [0, 0, 0, 1024],
    mustBeEmptyOnQuadrant3: 3584
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

  CMGPosition.squareNumberToString = function(squareNumber) {
    var colValue, rowValue;
    rowValue = Math.floor(squareNumber / CMGPosition.ROW_SPAN);
    colValue = squareNumber % CMGPosition.ROW_SPAN;
    return String.fromCharCode(colValue + 97) + String.fromCharCode(rowValue + 49);
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
            @param enPassantSquare (false|integer where integer is between 0 (bottom right corner) and 63 (top right corner)
            @param halfMoveClock (integer)
            @param moveNumber (integer)
    */
    this.piecesOfColor = {};
    this.piecesOfColor['b'] = {};
    this.piecesOfColor['w'] = {};
    if (this.pieces) {
      _ref = this.pieces;
      for (squareId in _ref) {
        piece = _ref[squareId];
        this.piecesOfColor[piece.color][squareId] = piece;
      }
    }
    this.bitBoards = {};
    this._generateBitBoards();
    this.lazy = {};
  }

  CMGPosition.prototype.clone = function(pieces, withLazyObject) {
    var out;
    if (pieces == null) pieces = false;
    if (withLazyObject == null) withLazyObject = false;
    if (!pieces) pieces = this.pieces;
    out = new CMGPosition(pieces, this.turn, this.allowedCastling, this.enPassantSquare, this.halfMoveClock, this.moveNumber);
    if (withLazyObject) out.lazy = CMGUtil.cloneObject(this.lazy);
    return out;
  };

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

  CMGPosition.prototype.allPossibleMovesFromSquare = function(squareKey, piece) {
    var out, pseudoMove, pseudoMoves, _i, _len;
    if (piece == null) piece = null;
    squareKey = CMGUtil.toString(squareKey);
    if (!piece) piece = this._getPieceOnSquare(squareKey);
    if (!piece) return 0x0;
    if (piece.color !== this.turn) return 0x0;
    pseudoMoves = this._allPseudoMovesFromSquare(squareKey);
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
      moves = this.allPossibleMovesFromSquare(square, piece);
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

  CMGPosition.prototype._opponentKingAttacked = function() {
    var opponentKingBitBoard;
    opponentKingBitBoard = this.bitBoards.allPiecesOfColorAndType[this.opponentColorCode()]['k'];
    return !CMGBitBoard.boolNand(opponentKingBitBoard, this._allPseudoMoveBitBoard());
  };

  CMGPosition.prototype._kingProtectedByOriginatingSquareOfNonKingMove = function(move) {
    var altPosition, pieces, qrbTreats, quadrant, squareAttackedByQRB, squareKey, value, _ref;
    if (!this.lazy.hasOwnProperty('kprot1')) this.lazy['kprot1'] = {};
    squareKey = '' + move.fromSquare;
    if (!this.lazy['kprot1'].hasOwnProperty(squareKey)) {
      _ref = CMGBitBoard.quadrantAndValueOfSquare(squareKey), quadrant = _ref[0], value = _ref[1];
      clg.log("quadrant is " + quadrant + " and value is " + value);
      qrbTreats = this._pseudoThreatsFromQRBOnPlayerBeforeMove();
      clg.log(qrbTreats, true);
      clg.log(qrbTreats[quadrant]);
      squareAttackedByQRB = 0 < (qrbTreats[quadrant] & value);
      clg.log("d7 attacked by qrb: " + squareAttackedByQRB);
      if (squareAttackedByQRB) {
        pieces = CMGUtil.cloneObject(this.pieces);
        delete pieces[move.fromSquare];
        altPosition = this.clone(pieces);
        altPosition.turn = this.opponentColorCode();
        altPosition.enPassantSquare = false;
        altPosition.allowedCastling = false;
        this.lazy['kprot1'][squareKey] = !CMGBitBoard.boolNand(this.bitBoards.allPiecesOfColorAndType[this.turn]['k'], altPosition._allPseudoMoveBitBoard());
      } else {
        this.lazy['kprot1'][squareKey] = false;
      }
    }
    return this.lazy['kprot1'][squareKey];
  };

  CMGPosition.prototype._attackedKingProtectedByTargetSquareOfNonKingMove = function(move) {
    var squareKey;
    if (!this.lazy.hasOwnProperty('kprot2')) this.lazy['kprot2'] = {};
    squareKey = '' + move.toSquare;
    if (!this.lazy['kprot2'].hasOwnProperty(squareKey)) {
      this.lazy['kprot2'][squareKey] = !move.newPosition._opponentKingAttacked();
    }
    return this.lazy['kprot2'][squareKey];
  };

  CMGPosition.prototype._getNewPositionObjectAfterMove = function(move) {
    var allowedCastling, enPassantSquare, halfMoveClock, moveNumber, out, pawnJump, pieces, turn;
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
        pieces[61] = pieces[63];
        delete pieces[63];
      }
      if (this.turn === 'w') {
        pieces[5] = pieces[7];
        delete pieces[7];
      }
    } else if (move.castling === 'q') {
      if (this.turn === 'b') {
        pieces[59] = pieces[56];
        delete pieces[56];
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
      case 56:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN;
        break;
      case 60:
        allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN & ~CMGPosition.CASTLING_CODE_BLACK_KING;
        break;
      case 63:
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
        case 56:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN;
          break;
        case 60:
          allowedCastling &= ~CMGPosition.CASTLING_CODE_BLACK_QUEEN & ~CMGPosition.CASTLING_CODE_BLACK_KING;
          break;
        case 63:
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
    out = new CMGPosition(pieces, turn, allowedCastling, enPassantSquare, halfMoveClock, moveNumber);
    return out;
  };

  CMGPosition.prototype._allPseudoMoves = function() {
    var castling, iSquareKey, move, newPiece, newPieceType, opponent, piece, pseudoMoveBitBoard, squareKey, takenOnSquare, takenPiece, target, targets, toPiece, _i, _j, _len, _len2, _ref, _ref2;
    if (!this.lazy.hasOwnProperty('pmv')) {
      this.lazy['pmv'] = [];
      this.lazy['pmvs'] = {};
      this.lazy['pmvbb'] = [0, 0, 0, 0];
      this.lazy['pqrbmvbb'] = [0, 0, 0, 0];
      opponent = this.opponentColorCode();
      _ref = this.piecesOfColor[this.turn];
      for (squareKey in _ref) {
        piece = _ref[squareKey];
        this.lazy['pmvs'][squareKey] = [];
        pseudoMoveBitBoard = this._bitBoardOfPseudoMovesFromSquare(squareKey, piece, this.turn, opponent);
        this.lazy['pmvbb'] = CMGBitBoard.binOr(this.lazy['pmvbb'], pseudoMoveBitBoard);
        if (piece.type === 'b' || piece.type === 'r' || piece.type === 'q') {
          this.lazy['pqrbmvbb'] = CMGBitBoard.binOr(this.lazy['pqrbmvbb'], pseudoMoveBitBoard);
        }
        targets = CMGBitBoard.bitBoardToSquareKeyArray(pseudoMoveBitBoard);
        for (_i = 0, _len = targets.length; _i < _len; _i++) {
          target = targets[_i];
          toPiece = piece;
          takenPiece = this._getPieceOnSquare(target);
          takenOnSquare = false;
          if (takenPiece) {
            takenOnSquare = target;
          } else if (piece.type === 'p' && parseInt(target) === this.enPassantSquare) {
            iSquareKey = parseInt(squareKey);
            switch (this.enPassantSquare - iSquareKey) {
              case -9:
                takenOnSquare = iSquareKey - 1;
                break;
              case -7:
                takenOnSquare = iSquareKey + 1;
                break;
              case 7:
                takenOnSquare = iSquareKey - 1;
                break;
              case 9:
                takenOnSquare = iSquareKey + 1;
            }
            if (takenOnSquare) takenPiece = this._getPieceOnSquare(takenOnSquare);
          }
          if (piece.type === 'p' && (target >= CMGPosition.TOP_LEFT_CORNER || target <= CMGPosition.BOTTOM_RIGHT_CORNER)) {
            _ref2 = ['q', 'r', 'n', 'b'];
            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
              newPieceType = _ref2[_j];
              newPiece = new CMGPiece(piece.color, newPieceType);
              move = new CMGMove(squareKey, piece, target, newPiece, null, false, takenPiece, takenOnSquare);
              move.setNewPositionObject(this._getNewPositionObjectAfterMove(move));
              this.lazy['pmvs'][squareKey].push(move);
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
            this.lazy['pmvs'][squareKey].push(move);
          }
        }
      }
    }
    return this.lazy['pmv'];
  };

  CMGPosition.prototype._allPseudoMovesFromSquare = function(squareKey) {
    if (!this.lazy.hasOwnProperty('pmvs')) this._allPseudoMoves();
    if (!this.lazy['pmvs'].hasOwnProperty(squareKey)) return [];
    return this.lazy['pmvs'][squareKey];
  };

  CMGPosition.prototype._allPseudoMoveBitBoard = function() {
    if (!this.lazy.hasOwnProperty('pmvbb')) this._allPseudoMoves();
    return this.lazy['pmvbb'];
  };

  CMGPosition.prototype._allPseudoQRBMoveBitBoard = function() {
    if (!this.lazy.hasOwnProperty('pqrbmvbb')) this._allPseudoMoves();
    return this.lazy['pqrbmvbb'];
  };

  CMGPosition.prototype._castlingPossibleOnSide = function(castlingSide) {
    var kingQuadrant, kingSquareBitBoard, threats;
    if (!this.lazy.hasOwnProperty('pks')) {
      this.lazy['pks'] = {
        'k': 0 < (this.allowedCastling & CMGPosition.CASTLING_CODE_ANY_KING),
        'q': 0 < (this.allowedCastling & CMGPosition.CASTLING_CODE_ANY_QUEEN)
      };
      if (this.lazy['pks']['k'] || this.lazy['pks']['q']) {
        threats = this._pseudoThreatsOnPlayerBeforeMove();
        kingSquareBitBoard = this.bitBoards.allPiecesOfColorAndType[this.turn]['k'];
        kingQuadrant = 0;
        if (this.turn === 'b') kingQuadrant = 3;
        if (0 < (kingSquareBitBoard[kingQuadrant] & threats[kingQuadrant])) {
          this.lazy['pks']['k'] = false;
          this.lazy['pks']['q'] = false;
        } else {
          if (this.lazy['pks']['k']) {
            if (0 < ((kingSquareBitBoard[kingQuadrant] << 1) & threats[kingQuadrant])) {
              this.lazy['pks']['k'] = false;
            }
          }
          if (this.lazy['pks']['q']) {
            if (0 < ((kingSquareBitBoard[kingQuadrant] >> 1) & threats[kingQuadrant])) {
              this.lazy['pks']['q'] = false;
            }
          }
        }
      }
    }
    return this.lazy['pks'][castlingSide];
  };

  CMGPosition.prototype._pseudoThreatsOnPlayerBeforeMove = function() {
    var invPosition;
    if (!this.lazy.hasOwnProperty('ptpbm')) {
      invPosition = this.clone();
      invPosition.turn = this.opponentColorCode();
      invPosition.enPassantSquare = false;
      invPosition.allowedCastling = false;
      this.lazy['ptpbm'] = invPosition._allPseudoMoveBitBoard();
      this.lazy['ptfqrbpbm'] = invPosition._allPseudoQRBMoveBitBoard();
    }
    return this.lazy['ptpbm'];
  };

  CMGPosition.prototype._pseudoThreatsFromQRBOnPlayerBeforeMove = function() {
    if (!this.lazy.hasOwnProperty('ptfqrbpbm')) {
      this._pseudoThreatsOnPlayerBeforeMove();
    }
    return this.lazy['ptfqrbpbm'];
  };

  CMGPosition.prototype._bitBoardOfPseudoMovesFromSquare = function(squareKey, movedPiece, stopAtColor, stopAfterColor) {
    var allShadows, nonTakingMoves, out, pawnMoveArrayKey, shadowDirections, shadows, takingMoves;
    if (stopAtColor == null) stopAtColor = false;
    if (stopAfterColor == null) stopAfterColor = false;
    out = [0, 0, 0, 0];
    if (!movedPiece) return [0, 0, 0, 0];
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
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_BLACK_KING) && 0 === (this.bitBoards.allPieces[3] & CMGPosition.CASTLING_BLACK_KING.mustBeEmptyOnQuadrant3)) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_BLACK_KING.move);
          }
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_BLACK_QUEEN) && 0 === (this.bitBoards.allPieces[3] & CMGPosition.CASTLING_BLACK_QUEEN.mustBeEmptyOnQuadrant3)) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_BLACK_QUEEN.move);
          }
        } else {
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_WHITE_KING) && 0 === (this.bitBoards.allPieces[0] & CMGPosition.CASTLING_WHITE_KING.mustBeEmptyOnQuadrant0)) {
            out = CMGBitBoard.binOr(out, CMGPosition.CASTLING_WHITE_KING.move);
          }
          if ((this.allowedCastling & CMGPosition.CASTLING_CODE_WHITE_QUEEN) && 0 === (this.bitBoards.allPieces[0] & CMGPosition.CASTLING_WHITE_QUEEN.mustBeEmptyOnQuadrant0)) {
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
    shadowMap = [0, 0, 0, 0];
    if (stopAtColor) {
      shadowMap = CMGBitBoard.binOr(shadowMap, this._computeSingleBehaviorShadows(squareKey, directions, stopAtColor, false));
    }
    if (stopAfterColor) {
      shadowMap = CMGBitBoard.binOr(shadowMap, this._computeSingleBehaviorShadows(squareKey, directions, stopAfterColor, true));
    }
    return shadowMap;
  };

  CMGPosition.prototype._computeSingleBehaviorShadows = function(squareKey, directions, stoppingColor, stopAfterOnly) {
    var direction, exclusionQuadrant, exclusionValue, newShadows, piece, pieceSquare, pieces, shadowMap, squareKeyBitBoard, _i, _len, _ref;
    if (stoppingColor == null) stoppingColor = '*';
    if (stopAfterOnly == null) stopAfterOnly = false;
    shadowMap = [0, 0, 0, 0];
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
      exclusionQuadrant = false;
      exclusionValue = false;
      if (stopAfterOnly) {
        _ref = CMGBitBoard.quadrantAndValueOfSquare(pieceSquare), exclusionQuadrant = _ref[0], exclusionValue = _ref[1];
        exclusionValue = (~exclusionValue) & 0xffff;
      }
      for (_i = 0, _len = directions.length; _i < _len; _i++) {
        direction = directions[_i];
        if (!CMGBitBoard.boolNand(CMGPosition._light(pieceSquare, direction), squareKeyBitBoard)) {
          newShadows = CMGBitBoard.clone(CMGPosition._shadow(pieceSquare, direction));
          if (stopAfterOnly) newShadows[exclusionQuadrant] &= exclusionValue;
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
    var castlingSide, delta, val;
    if (move.fromPiece.type === 'p' && (Math.abs(move.toSquare - move.fromSquare) % 8) !== 0 && move.takenPiece === false) {
      return CMGPosition.PSEUDO_ONLY;
    }
    val = false;
    if (this.toString() === "r4rk1/p1ppqpb1/bn2pnp1/3PN3/1pP1P3/5Q1p/PP1BBPPP/RN2K2R b KQ c3 0 2" && move.fromSquare === '25' && move.toSquare === '18') {
      val = true;
    }
    clg.open(false);
    if (move.fromPiece.type === 'k') {
      clg.log('King move ' + move.toString());
      if (move.newPosition._opponentKingAttacked()) return CMGPosition.PSEUDO_ONLY;
    } else if (move.isEnPassant()) {
      clg.log('En passant move ' + move.toString());
      if (move.newPosition._opponentKingAttacked()) return CMGPosition.PSEUDO_ONLY;
    } else if (!CMGBitBoard.boolNand(this.bitBoards.allPiecesOfColorAndType[this.turn]['k'], this._pseudoThreatsOnPlayerBeforeMove())) {
      clg.log('king attacked before move ' + move.toString());
      if (!this._attackedKingProtectedByTargetSquareOfNonKingMove(move)) {
        return CMGPosition.PSEUDO_ONLY;
      }
    } else {
      clg.log('king NOT attacked before move ' + move.toString());
      if (this._kingProtectedByOriginatingSquareOfNonKingMove(move)) {
        clg.log("King is protected by square " + move.fromSquare);
        if (!this._attackedKingProtectedByTargetSquareOfNonKingMove(move)) {
          return CMGPosition.PSEUDO_ONLY;
        }
      }
    }
    if (move.fromPiece.type === 'k') {
      delta = parseInt(move.toSquare) - parseInt(move.fromSquare);
      if (Math.abs(delta) === 2) {
        castlingSide = 'k';
        if (delta < 0) castlingSide = 'q';
        if (!this._castlingPossibleOnSide(castlingSide)) {
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
    var color, quadrant, square, type, value, _ref, _ref2, _ref3, _results;
    this.bitBoards.allPieces = [0, 0, 0, 0];
    this.bitBoards.allPiecesOfColor = {
      'b': [0, 0, 0, 0],
      'w': [0, 0, 0, 0]
    };
    this.bitBoards.allPiecesOfColorAndType = {
      'b': {
        'r': [0, 0, 0, 0],
        'n': [0, 0, 0, 0],
        'b': [0, 0, 0, 0],
        'k': [0, 0, 0, 0],
        'q': [0, 0, 0, 0],
        'p': [0, 0, 0, 0]
      },
      'w': {
        'r': [0, 0, 0, 0],
        'n': [0, 0, 0, 0],
        'b': [0, 0, 0, 0],
        'k': [0, 0, 0, 0],
        'q': [0, 0, 0, 0],
        'p': [0, 0, 0, 0]
      }
    };
    _ref = this.pieces;
    _results = [];
    for (square in _ref) {
      _ref2 = _ref[square], color = _ref2.color, type = _ref2.type;
      _ref3 = CMGBitBoard.quadrantAndValueOfSquare(square), quadrant = _ref3[0], value = _ref3[1];
      this.bitBoards.allPieces[quadrant] |= value;
      this.bitBoards.allPiecesOfColor[color][quadrant] |= value;
      _results.push(this.bitBoards.allPiecesOfColorAndType[color][type][quadrant] |= value);
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

  CMGMove.prototype.getNewPosition = function() {
    return this.newPosition;
  };

  CMGMove.prototype.setNewPositionObject = function(newPosition) {
    this.newPosition = newPosition;
  };

  CMGMove.prototype.isEnPassant = function() {
    clg.log('Taken piece is ' + this.takenPiece + ' on square ' + this.takenOnSquare);
    if (this.takenPiece === false) return false;
    return this.takenOnSquare !== this.toSquare;
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

NoCompile = {};

NoCompile.position = CMGPosition;

NoCompile.position['fromString'] = CMGPosition.fromString;

NoCompile.position.prototype['clone'] = CMGPosition.prototype.clone;

NoCompile.position.prototype['playerColorCode'] = CMGPosition.prototype.playerColorCode;

NoCompile.position.prototype['opponentColorCode'] = CMGPosition.prototype.opponentColorCode;

NoCompile.position.prototype['toString'] = CMGPosition.prototype.toString;

NoCompile.position.prototype['toStringWithoutCounters'] = CMGPosition.prototype.toStringWithoutCounters;

NoCompile.position.prototype['allPossibleMovesFromSquare'] = CMGPosition.prototype.allPossibleMovesFromSquare;

NoCompile.position.prototype['allPossibleMoves'] = CMGPosition.prototype.allPossibleMoves;

NoCompile.position.prototype['isDraw'] = CMGPosition.prototype.isDraw;

NoCompile.position.prototype['getWinnerColorCode'] = CMGPosition.prototype.getWinnerColorCode;

NoCompile.move = CMGMove;

NoCompile.move['fromStringAndPosition'] = CMGMove.fromStringAndPosition;

NoCompile.move.prototype['toString'] = CMGMove.prototype.toString;

NoCompile.move.prototype['getNewPosition'] = CMGMove.prototype.getNewPosition;

if (typeof window !== 'undefined') {
  window['ChessPosition'] = NoCompile.position;
  window['ChessMove'] = NoCompile.move;
}

if (typeof module !== 'undefined') {
  module['exports']['position'] = NoCompile.position;
  module['exports']['move'] = NoCompile.move;
}
/* chess-move-generator.complements-for-tests.js */
/*
Chess Move Generator - Complements for Tests
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md
*/
var clg, profiler;

Function.prototype.trace = function() {
  var current, trace;
  trace = [];
  current = this;
  while (current) {
    trace.push(current.signature());
    current = current.caller;
  }
  return trace;
};

Function.prototype.signature = function() {
  var ftostring, signature, x, _ref;
  ftostring = function() {
    var params;
    params = "";
    if (this.params.length > 0) params = "'" + this.params.join("', '") + "'";
    return this.name + "(" + params + ")";
  };
  signature = {
    name: this.getName(),
    params: [],
    toString: ftostring
  };
  if (this.arguments) {
    for (x = 0, _ref = arguments.length - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
      signature.params.push(this.arguments[x]);
    }
  }
  return signature;
};

Function.prototype.getName = function() {
  var definition, exp;
  if (this.name) return this.name;
  definition = this.toString().split("\n")[0];
  exp = /^function ([^\s(]+).+/;
  if (exp.test(definition)) {
    return definition.split("\n")[0].replace(exp, "$1") || "anonymous";
  }
  return "anonymous";
};

profiler = (function() {

  function profiler() {}

  profiler.threshhold = 100000;

  profiler.pile = [];

  profiler.open = function(name) {
    var description;
    description = {
      start: new Date().getTime(),
      name: name
    };
    return this.pile.push(description);
  };

  profiler.close = function() {
    var description, duration, i, indent, _ref;
    description = this.pile.pop();
    duration = new Date().getTime() - description.start;
    if (duration < this.threshhold) return false;
    indent = "";
    for (i = 1, _ref = this.pile.length; 1 <= _ref ? i <= _ref : i >= _ref; 1 <= _ref ? i++ : i--) {
      indent = indent + "    ";
    }
    return console.log(indent + description.name + ': ' + duration);
  };

  return profiler;

})();

clg = (function() {

  function clg() {}

  clg.opened = false;

  clg.open = function(val) {
    var prev;
    if (val == null) val = true;
    prev = this.opened;
    this.opened = val;
    return prev;
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

NoCompile.position['_allowedCastlingStringToValue'] = CMGPosition._allowedCastlingStringToValue;

NoCompile.position['_allowedCastlingValueToString'] = CMGPosition._allowedCastlingValueToString;

NoCompile.bitBoard = CMGBitBoard;

NoCompile.bitBoard['valueOfSquare'] = CMGBitBoard.valueOfSquare;

if (typeof module !== 'undefined') {
  module['exports']['bitBoard'] = NoCompile.bitBoard;
}
/* bitboards.js */
// Generated chess bitboards - copyright 2012 François Cardinaux, Genève
CMGPosition.QUEEN_MOVES = [[1022,2309,8465,33089],[2045,4618,16930,642],[3835,9237,33860,1028],[7415,18730,2184,2056],[14575,37460,4113,4112],[28895,9384,8482,8224],[57535,18512,16964,16449],[49279,37024,33928,33154],[65027,1283,4361,16673],[64775,2567,8722,33346],[64270,5390,17444,1156],[63260,10780,34889,2056],[61240,21560,4498,4112],[57200,43120,8740,8225],[49120,20704,17480,16706],[32704,41152,34960,33412],[773,1022,2309,8465],[1802,2045,4618,16930],[3605,3835,9237,33860],[7210,7415,18730,2184],[14420,14575,37460,4113],[28840,28895,9384,8482],[57424,57535,18512,16964],[49312,49279,37024,33928],[1289,65027,1283,4361],[2578,64775,2567,8722],[5412,64270,5390,17444],[10825,63260,10780,34889],[21650,61240,21560,4498],[43044,57200,43120,8740],[20552,49120,20704,17480],[41104,32704,41152,34960],[2321,773,1022,2309],[4642,1802,2045,4618],[9284,3605,3835,9237],[18824,7210,7415,18730],[37393,14420,14575,37460],[9250,28840,28895,9384],[18500,57424,57535,18512],[37000,49312,49279,37024],[4385,1289,65027,1283],[8770,2578,64775,2567],[17540,5412,64270,5390],[34824,10825,63260,10780],[4368,21650,61240,21560],[8737,43044,57200,43120],[17474,20552,49120,20704],[34948,41104,32704,41152],[8513,2321,773,1022],[17026,4642,1802,2045],[33796,9284,3605,3835],[2056,18824,7210,7415],[4112,37393,14420,14575],[8480,9250,28840,28895],[16961,18500,57424,57535],[33922,37000,49312,49279],[16769,4385,1289,65027],[33282,8770,2578,64775],[1028,17540,5412,64270],[2056,34824,10825,63260],[4112,4368,21650,61240],[8224,8737,43044,57200],[16704,17474,20552,49120],[33409,34948,41104,32704]];
CMGPosition.ROOK_MOVES = [[510,257,257,257],[765,514,514,514],[1275,1028,1028,1028],[2295,2056,2056,2056],[4335,4112,4112,4112],[8415,8224,8224,8224],[16575,16448,16448,16448],[32895,32896,32896,32896],[65025,257,257,257],[64770,514,514,514],[64260,1028,1028,1028],[63240,2056,2056,2056],[61200,4112,4112,4112],[57120,8224,8224,8224],[48960,16448,16448,16448],[32640,32896,32896,32896],[257,510,257,257],[514,765,514,514],[1028,1275,1028,1028],[2056,2295,2056,2056],[4112,4335,4112,4112],[8224,8415,8224,8224],[16448,16575,16448,16448],[32896,32895,32896,32896],[257,65025,257,257],[514,64770,514,514],[1028,64260,1028,1028],[2056,63240,2056,2056],[4112,61200,4112,4112],[8224,57120,8224,8224],[16448,48960,16448,16448],[32896,32640,32896,32896],[257,257,510,257],[514,514,765,514],[1028,1028,1275,1028],[2056,2056,2295,2056],[4112,4112,4335,4112],[8224,8224,8415,8224],[16448,16448,16575,16448],[32896,32896,32895,32896],[257,257,65025,257],[514,514,64770,514],[1028,1028,64260,1028],[2056,2056,63240,2056],[4112,4112,61200,4112],[8224,8224,57120,8224],[16448,16448,48960,16448],[32896,32896,32640,32896],[257,257,257,510],[514,514,514,765],[1028,1028,1028,1275],[2056,2056,2056,2295],[4112,4112,4112,4335],[8224,8224,8224,8415],[16448,16448,16448,16575],[32896,32896,32896,32895],[257,257,257,65025],[514,514,514,64770],[1028,1028,1028,64260],[2056,2056,2056,63240],[4112,4112,4112,61200],[8224,8224,8224,57120],[16448,16448,16448,48960],[32896,32896,32896,32640]];
CMGPosition.BISHOP_MOVES = [[512,2052,8208,32832],[1280,4104,16416,128],[2560,8209,32832,0],[5120,16674,128,0],[10240,33348,1,0],[20480,1160,258,0],[40960,2064,516,1],[16384,4128,1032,258],[2,1026,4104,16416],[5,2053,8208,32832],[10,4362,16416,128],[20,8724,32833,0],[40,17448,386,0],[80,34896,516,1],[160,4256,1032,258],[64,8256,2064,516],[516,512,2052,8208],[1288,1280,4104,16416],[2577,2560,8209,32832],[5154,5120,16674,128],[10308,10240,33348,1],[20616,20480,1160,258],[40976,40960,2064,516],[16416,16384,4128,1032],[1032,2,1026,4104],[2064,5,2053,8208],[4384,10,4362,16416],[8769,20,8724,32833],[17538,40,17448,386],[34820,80,34896,516],[4104,160,4256,1032],[8208,64,8256,2064],[2064,516,512,2052],[4128,1288,1280,4104],[8256,2577,2560,8209],[16768,5154,5120,16674],[33281,10308,10240,33348],[1026,20616,20480,1160],[2052,40976,40960,2064],[4104,16416,16384,4128],[4128,1032,2,1026],[8256,2064,5,2053],[16512,4384,10,4362],[32768,8769,20,8724],[256,17538,40,17448],[513,34820,80,34896],[1026,4104,160,4256],[2052,8208,64,8256],[8256,2064,516,512],[16512,4128,1288,1280],[32768,8256,2577,2560],[0,16768,5154,5120],[0,33281,10308,10240],[256,1026,20616,20480],[513,2052,40976,40960],[1026,4104,16416,16384],[16512,4128,1032,2],[32768,8256,2064,5],[0,16512,4384,10],[0,32768,8769,20],[0,256,17538,40],[0,513,34820,80],[256,1026,4104,160],[513,2052,8208,64]];
CMGPosition.KNIGHT_MOVES = [[1024,2,0,0],[2048,5,0,0],[4352,10,0,0],[8704,20,0,0],[17408,40,0,0],[34816,80,0,0],[4096,160,0,0],[8192,64,0,0],[4,516,0,0],[8,1288,0,0],[17,2577,0,0],[34,5154,0,0],[68,10308,0,0],[136,20616,0,0],[16,40976,0,0],[32,16416,0,0],[1026,1024,2,0],[2053,2048,5,0],[4362,4352,10,0],[8724,8704,20,0],[17448,17408,40,0],[34896,34816,80,0],[4256,4096,160,0],[8256,8192,64,0],[512,4,516,0],[1280,8,1288,0],[2560,17,2577,0],[5120,34,5154,0],[10240,68,10308,0],[20480,136,20616,0],[40960,16,40976,0],[16384,32,16416,0],[0,1026,1024,2],[0,2053,2048,5],[0,4362,4352,10],[0,8724,8704,20],[0,17448,17408,40],[0,34896,34816,80],[0,4256,4096,160],[0,8256,8192,64],[0,512,4,516],[0,1280,8,1288],[0,2560,17,2577],[0,5120,34,5154],[0,10240,68,10308],[0,20480,136,20616],[0,40960,16,40976],[0,16384,32,16416],[0,0,1026,1024],[0,0,2053,2048],[0,0,4362,4352],[0,0,8724,8704],[0,0,17448,17408],[0,0,34896,34816],[0,0,4256,4096],[0,0,8256,8192],[0,0,512,4],[0,0,1280,8],[0,0,2560,17],[0,0,5120,34],[0,0,10240,68],[0,0,20480,136],[0,0,40960,16],[0,0,16384,32]];
CMGPosition.KING_MOVES_WITHOUT_CASTLING = [[770,0,0,0],[1797,0,0,0],[3594,0,0,0],[7188,0,0,0],[14376,0,0,0],[28752,0,0,0],[57504,0,0,0],[49216,0,0,0],[515,3,0,0],[1287,7,0,0],[2574,14,0,0],[5148,28,0,0],[10296,56,0,0],[20592,112,0,0],[41184,224,0,0],[16576,192,0,0],[768,770,0,0],[1792,1797,0,0],[3584,3594,0,0],[7168,7188,0,0],[14336,14376,0,0],[28672,28752,0,0],[57344,57504,0,0],[49152,49216,0,0],[0,515,3,0],[0,1287,7,0],[0,2574,14,0],[0,5148,28,0],[0,10296,56,0],[0,20592,112,0],[0,41184,224,0],[0,16576,192,0],[0,768,770,0],[0,1792,1797,0],[0,3584,3594,0],[0,7168,7188,0],[0,14336,14376,0],[0,28672,28752,0],[0,57344,57504,0],[0,49152,49216,0],[0,0,515,3],[0,0,1287,7],[0,0,2574,14],[0,0,5148,28],[0,0,10296,56],[0,0,20592,112],[0,0,41184,224],[0,0,16576,192],[0,0,768,770],[0,0,1792,1797],[0,0,3584,3594],[0,0,7168,7188],[0,0,14336,14376],[0,0,28672,28752],[0,0,57344,57504],[0,0,49152,49216],[0,0,0,515],[0,0,0,1287],[0,0,0,2574],[0,0,0,5148],[0,0,0,10296],[0,0,0,20592],[0,0,0,41184],[0,0,0,16576]];
CMGPosition.PAWN_NON_TAKING_MOVES = {}
CMGPosition.PAWN_NON_TAKING_MOVES['b'] = [[1,0,0,0],[2,0,0,0],[4,0,0,0],[8,0,0,0],[16,0,0,0],[32,0,0,0],[64,0,0,0],[128,0,0,0],[256,0,0,0],[512,0,0,0],[1024,0,0,0],[2048,0,0,0],[4096,0,0,0],[8192,0,0,0],[16384,0,0,0],[32768,0,0,0],[0,1,0,0],[0,2,0,0],[0,4,0,0],[0,8,0,0],[0,16,0,0],[0,32,0,0],[0,64,0,0],[0,128,0,0],[0,256,0,0],[0,512,0,0],[0,1024,0,0],[0,2048,0,0],[0,4096,0,0],[0,8192,0,0],[0,16384,0,0],[0,32768,0,0],[0,0,1,0],[0,0,2,0],[0,0,4,0],[0,0,8,0],[0,0,16,0],[0,0,32,0],[0,0,64,0],[0,0,128,0],[0,0,257,0],[0,0,514,0],[0,0,1028,0],[0,0,2056,0],[0,0,4112,0],[0,0,8224,0],[0,0,16448,0],[0,0,32896,0]]
CMGPosition.PAWN_NON_TAKING_MOVES['w'] = [[0,257,0,0],[0,514,0,0],[0,1028,0,0],[0,2056,0,0],[0,4112,0,0],[0,8224,0,0],[0,16448,0,0],[0,32896,0,0],[0,256,0,0],[0,512,0,0],[0,1024,0,0],[0,2048,0,0],[0,4096,0,0],[0,8192,0,0],[0,16384,0,0],[0,32768,0,0],[0,0,1,0],[0,0,2,0],[0,0,4,0],[0,0,8,0],[0,0,16,0],[0,0,32,0],[0,0,64,0],[0,0,128,0],[0,0,256,0],[0,0,512,0],[0,0,1024,0],[0,0,2048,0],[0,0,4096,0],[0,0,8192,0],[0,0,16384,0],[0,0,32768,0],[0,0,0,1],[0,0,0,2],[0,0,0,4],[0,0,0,8],[0,0,0,16],[0,0,0,32],[0,0,0,64],[0,0,0,128],[0,0,0,256],[0,0,0,512],[0,0,0,1024],[0,0,0,2048],[0,0,0,4096],[0,0,0,8192],[0,0,0,16384],[0,0,0,32768]]
CMGPosition.PAWN_TAKING_MOVES = {}
CMGPosition.PAWN_TAKING_MOVES['b'] = [[2,0,0,0],[5,0,0,0],[10,0,0,0],[20,0,0,0],[40,0,0,0],[80,0,0,0],[160,0,0,0],[64,0,0,0],[512,0,0,0],[1280,0,0,0],[2560,0,0,0],[5120,0,0,0],[10240,0,0,0],[20480,0,0,0],[40960,0,0,0],[16384,0,0,0],[0,2,0,0],[0,5,0,0],[0,10,0,0],[0,20,0,0],[0,40,0,0],[0,80,0,0],[0,160,0,0],[0,64,0,0],[0,512,0,0],[0,1280,0,0],[0,2560,0,0],[0,5120,0,0],[0,10240,0,0],[0,20480,0,0],[0,40960,0,0],[0,16384,0,0],[0,0,2,0],[0,0,5,0],[0,0,10,0],[0,0,20,0],[0,0,40,0],[0,0,80,0],[0,0,160,0],[0,0,64,0],[0,0,512,0],[0,0,1280,0],[0,0,2560,0],[0,0,5120,0],[0,0,10240,0],[0,0,20480,0],[0,0,40960,0],[0,0,16384,0]]
CMGPosition.PAWN_TAKING_MOVES['w'] = [[0,2,0,0],[0,5,0,0],[0,10,0,0],[0,20,0,0],[0,40,0,0],[0,80,0,0],[0,160,0,0],[0,64,0,0],[0,512,0,0],[0,1280,0,0],[0,2560,0,0],[0,5120,0,0],[0,10240,0,0],[0,20480,0,0],[0,40960,0,0],[0,16384,0,0],[0,0,2,0],[0,0,5,0],[0,0,10,0],[0,0,20,0],[0,0,40,0],[0,0,80,0],[0,0,160,0],[0,0,64,0],[0,0,512,0],[0,0,1280,0],[0,0,2560,0],[0,0,5120,0],[0,0,10240,0],[0,0,20480,0],[0,0,40960,0],[0,0,16384,0],[0,0,0,2],[0,0,0,5],[0,0,0,10],[0,0,0,20],[0,0,0,40],[0,0,0,80],[0,0,0,160],[0,0,0,64],[0,0,0,512],[0,0,0,1280],[0,0,0,2560],[0,0,0,5120],[0,0,0,10240],[0,0,0,20480],[0,0,0,40960],[0,0,0,16384]]
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
    [0,0,0,32768]
];
