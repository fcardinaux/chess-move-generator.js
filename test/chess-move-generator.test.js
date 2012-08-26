/*
Chess Move Generator: Unit tests
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md

About Expresso: http://visionmedia.github.com/expresso/

Profiling:

* Using [nodetime](http://nodetime.com/):

        sudo npm install nodetime

* NOT ON MACOSX / Using [dtrace and flamegraph](http://blog.nodejs.org/2012/04/25/profiling-node-js/):

        sudo dtrace -n 'profile-97/execname == "node" && arg1/{@[jstack(150, 8000)] = count(); } tick-60s { exit(0); }' > stacks.out
        sudo dtrace -n 'profile-97/pid == 1851 && arg1/{@[jstack(150, 8000)] = count(); } tick-60s { exit(0); }' > stacks.out
        stackvis dtrace flamegraph-svg < stacks.out > stacks.svg
*/
var DEPTH, DO_DIVISION_TEST, DO_ELEMENTARY_TESTS, DO_PERFTSUITE, DO_POSSIBLE_MOVE_TEST, LOG_DIVISION_TEST, LOG_MOVE_TEST, LOG_PERFTSUITE, bitBoardClass, chessMoveGenerator, compareArrays, getInitialCounterArray, positionClass, testDepth, trimString;

DO_ELEMENTARY_TESTS = true;

DO_POSSIBLE_MOVE_TEST = true;

DO_DIVISION_TEST = false;

DO_PERFTSUITE = true;

DEPTH = 4;

LOG_MOVE_TEST = function(x) {};

LOG_DIVISION_TEST = function(x) {
  return console.log(x);
};

LOG_PERFTSUITE = function(x) {
  return console.log(x);
};

chessMoveGenerator = require('../javascript/chess-move-generator');

positionClass = chessMoveGenerator.position;

bitBoardClass = chessMoveGenerator.bitBoard;

getInitialCounterArray = function(maxDepth) {
  var counters, iDepth, _ref;
  counters = [];
  for (iDepth = 0, _ref = maxDepth - 1; 0 <= _ref ? iDepth <= _ref : iDepth >= _ref; 0 <= _ref ? iDepth++ : iDepth--) {
    counters.push(0);
  }
  return counters;
};

testDepth = function(positionObj, counters, currentDepth, maxDepth, log) {
  var move, moveId, moveQuantity, moves, pos, _len;
  if (log == null) log = false;
  moves = positionObj.allPossibleMoves();
  moveQuantity = moves.length;
  counters[currentDepth] += moveQuantity;
  currentDepth++;
  if (currentDepth >= maxDepth) return true;
  for (moveId = 0, _len = moves.length; moveId < _len; moveId++) {
    move = moves[moveId];
    if (log) {
      LOG_PERFTSUITE("  * testing move " + (moveId + 1) + " of " + moveQuantity + " (" + (move.toString()) + ")");
    }
    pos = move.getNewPosition().clone(false, true);
    testDepth(pos, counters, currentDepth, maxDepth);
    move = null;
    delete move;
    pos = null;
    delete pos;
  }
  moves = null;
  delete moves;
  return true;
};

trimString = function(str) {
  return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');
};

compareArrays = function(arr1, arr2) {
  var elem1, elem2, lookup1, lookup2, missingInArr1, missingInArr2, _i, _j, _k, _len, _len2, _len3;
  missingInArr1 = [];
  missingInArr2 = [];
  lookup1 = {};
  for (_i = 0, _len = arr1.length; _i < _len; _i++) {
    elem1 = arr1[_i];
    lookup1[elem1] = elem1;
  }
  lookup2 = {};
  for (_j = 0, _len2 = arr2.length; _j < _len2; _j++) {
    elem2 = arr2[_j];
    lookup2[elem2] = elem2;
    if (typeof lookup1[elem2] === 'undefined') missingInArr1.push(elem2);
  }
  for (_k = 0, _len3 = arr1.length; _k < _len3; _k++) {
    elem1 = arr1[_k];
    if (typeof lookup2[elem1] === 'undefined') missingInArr2.push(elem1);
  }
  return [missingInArr1, missingInArr2];
};

module.exports = {
  'test CMGBitBoard#valueOfSquare': function(beforeExit, assert) {
    if (!DO_ELEMENTARY_TESTS) return;
    assert.eql([0x0, 0x8000, 0x0, 0x0], bitBoardClass.valueOfSquare(31));
    assert.eql([0x1, 0x0, 0x0, 0x0], bitBoardClass.valueOfSquare(0));
    assert.eql([0x80, 0x0, 0x0, 0x0], bitBoardClass.valueOfSquare(7));
    assert.eql([0x100, 0x0, 0x0, 0x0], bitBoardClass.valueOfSquare(8));
    assert.eql([0x8000, 0x0, 0x0, 0x0], bitBoardClass.valueOfSquare(15));
    assert.eql([0x0, 0x1, 0x0, 0x0], bitBoardClass.valueOfSquare(16));
    assert.eql([0x0, 0x80, 0x0, 0x0], bitBoardClass.valueOfSquare(23));
    assert.eql([0x0, 0x100, 0x0, 0x0], bitBoardClass.valueOfSquare(24));
    assert.eql([0x0, 0x0, 0x1, 0x0], bitBoardClass.valueOfSquare(32));
    return assert.eql([0x0, 0x0, 0x0, 0x8000], bitBoardClass.valueOfSquare(63));
  },
  'test CMGPosition#fromString': function(beforeExit, assert) {
    var posObj, positionString, positionStrings, _i, _len, _results;
    if (!DO_ELEMENTARY_TESTS) return;
    positionStrings = ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 0", "8/2p5/K2p4/1P5r/1R3p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/1P5r/KR3p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/R4p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/2R2p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/3R1p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/4Rp1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/5R1k/8/4P1P1/8 b - - 0 0", "8/2p5/3p4/KP5r/5p1k/1R6/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/5p1k/8/1R2P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/5p1k/8/4P1P1/1R6 b - - 1 0", "8/2p5/3p4/KP5r/1R3p1k/4P3/6P1/8 b - - 0 0", "8/2p5/3p4/KP5r/1R2Pp1k/8/6P1/8 b - e3 0 0", "8/2p5/3p4/KP5r/1R3p1k/6P1/4P3/8 b - - 0 0", "8/2p5/3p4/KP5r/1R3pPk/8/4P3/8 b - g3 0 0"];
    _results = [];
    for (_i = 0, _len = positionStrings.length; _i < _len; _i++) {
      positionString = positionStrings[_i];
      _results.push(posObj = positionClass.fromString(positionString));
    }
    return _results;
  },
  'test CMGPosition#_allowedCastlingValueToString': function(beforeExit, assert) {
    if (!DO_ELEMENTARY_TESTS) return;
    assert.eql("KQkq", positionClass._allowedCastlingValueToString(15));
    assert.eql("KQk", positionClass._allowedCastlingValueToString(14));
    assert.eql("KQq", positionClass._allowedCastlingValueToString(13));
    assert.eql("KQ", positionClass._allowedCastlingValueToString(12));
    assert.eql("Kkq", positionClass._allowedCastlingValueToString(11));
    assert.eql("Kk", positionClass._allowedCastlingValueToString(10));
    assert.eql("Kq", positionClass._allowedCastlingValueToString(9));
    assert.eql("K", positionClass._allowedCastlingValueToString(8));
    assert.eql("Qkq", positionClass._allowedCastlingValueToString(7));
    assert.eql("Qk", positionClass._allowedCastlingValueToString(6));
    assert.eql("Qq", positionClass._allowedCastlingValueToString(5));
    assert.eql("Q", positionClass._allowedCastlingValueToString(4));
    assert.eql("kq", positionClass._allowedCastlingValueToString(3));
    assert.eql("k", positionClass._allowedCastlingValueToString(2));
    assert.eql("q", positionClass._allowedCastlingValueToString(1));
    return assert.eql("-", positionClass._allowedCastlingValueToString(0));
  },
  'test CMGPosition#_allowedCastlingStringToValue': function(beforeExit, assert) {
    if (!DO_ELEMENTARY_TESTS) return;
    assert.eql(15, positionClass._allowedCastlingStringToValue("KQkq"));
    assert.eql(14, positionClass._allowedCastlingStringToValue("KQk"));
    assert.eql(13, positionClass._allowedCastlingStringToValue("KQq"));
    assert.eql(12, positionClass._allowedCastlingStringToValue("KQ"));
    assert.eql(11, positionClass._allowedCastlingStringToValue("Kkq"));
    assert.eql(10, positionClass._allowedCastlingStringToValue("Kk"));
    assert.eql(9, positionClass._allowedCastlingStringToValue("Kq"));
    assert.eql(8, positionClass._allowedCastlingStringToValue("K"));
    assert.eql(7, positionClass._allowedCastlingStringToValue("Qkq"));
    assert.eql(6, positionClass._allowedCastlingStringToValue("Qk"));
    assert.eql(5, positionClass._allowedCastlingStringToValue("Qq"));
    assert.eql(4, positionClass._allowedCastlingStringToValue("Q"));
    assert.eql(3, positionClass._allowedCastlingStringToValue("kq"));
    assert.eql(2, positionClass._allowedCastlingStringToValue("k"));
    assert.eql(1, positionClass._allowedCastlingStringToValue("q"));
    return assert.eql(0, positionClass._allowedCastlingStringToValue("-"));
  },
  'test CMGPosition#playerColorCode': function(beforeExit, assert) {
    var colorCode, positionObj, positionString, testData, _i, _len, _ref, _results;
    if (!DO_ELEMENTARY_TESTS) return;
    testData = [['w', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"], ['b', "4k3/8/R7/8/7b/8/3P4/7K b - - 33 32"], ['b', "rn2k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/R3K2R b Kq e3 3 12"], ['w', "r3k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/RN2K2R w Qk e6 3 12"]];
    _results = [];
    for (_i = 0, _len = testData.length; _i < _len; _i++) {
      _ref = testData[_i], colorCode = _ref[0], positionString = _ref[1];
      positionObj = positionClass.fromString(positionString);
      _results.push(assert.eql(colorCode, positionObj.playerColorCode()));
    }
    return _results;
  },
  'test CMGPosition#opponentColorCode': function(beforeExit, assert) {
    var colorCode, positionObj, positionString, testData, _i, _len, _ref, _results;
    if (!DO_ELEMENTARY_TESTS) return;
    testData = [['b', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"], ['w', "4k3/8/R7/8/7b/8/3P4/7K b - - 33 32"], ['w', "rn2k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/R3K2R b Kq e3 3 12"], ['b', "r3k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/RN2K2R w Qk e6 3 12"]];
    _results = [];
    for (_i = 0, _len = testData.length; _i < _len; _i++) {
      _ref = testData[_i], colorCode = _ref[0], positionString = _ref[1];
      positionObj = positionClass.fromString(positionString);
      _results.push(assert.eql(colorCode, positionObj.opponentColorCode()));
    }
    return _results;
  },
  'test CMGPosition#allPossibleMoves': function(beforeExit, assert) {
    var calculatedEndPositionStrings, calculatedMove, calculatedMoves, eps, expectedEndPositionStrings, positionObj, result, startPositionString, testVector, _i, _j, _k, _len, _len2, _len3, _ref, _results;
    if (!DO_POSSIBLE_MOVE_TEST) return;
    testVector = [["r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3 1 1", ["r4rk1/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQ - 2 2", "2kr3r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQ - 2 2", "r4k1r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQ - 2 2", "r2k3r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQ - 2 2", "r3k2r/p2pqpb1/bnp1pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p2pqpb1/bn2pnp1/2pPN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq c6 0 2", "r3k2r/p1p1qpb1/bn1ppnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn3np1/3pN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pn2/3PN1p1/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/P3P3/1pN2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/4P3/p1N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/P3P3/2p2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q2/1PPBBPpP/R3K2R w KQkq - 0 2", "1r2k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQk - 2 2", "2r1k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQk - 2 2", "3rk2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQk - 2 2", "r3k1r1/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQq - 2 2", "r3kr2/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpbr/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpb1/bn2pnpr/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpb1/bn2pnp1/3PN2r/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpb1/bn2pnp1/3PN3/Pp2P2r/2N2Q1p/1PPBBPPP/R3K2R w KQq - 2 2", "r3k2r/p1pp1pb1/bn1qpnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1pp1pb1/bn2pnp1/2qPN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3kq1r/p1pp1pb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r2qk2r/p1pp1pb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqp2/bn2pnpb/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3kb1r/p1ppqp2/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/pbppqpb1/1n2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r1b1k2r/p1ppqpb1/1n2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/1b1PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/3PN3/Ppb1P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/3PN3/Pp2P3/2Nb1Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBbPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/b3pnp1/3PN3/np2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r1n1k2r/p1ppqpb1/b3pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/b3pnp1/3nN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/b3pnp1/3PN3/Ppn1P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/bn2p1p1/3PN3/Pp2n3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k1nr/p1ppqpb1/bn2p1p1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/bn2p1p1/3nN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpbn/bn2p1p1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/bn2p1p1/3PN2n/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/bn2p1p1/3PN3/Pp2P1n1/2N2Q1p/1PPBBPPP/R3K2R w KQkq - 2 2"]], ["r3k2r/p1p1qpb1/bn1ppnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 b kq - 1 2", ["r4k1r/p1p1qpb1/bn1ppnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w - - 2 3", "r2k3r/p1p1qpb1/bn1ppnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w - - 2 3", "r3k2r/p3qpb1/bnpppnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w kq - 0 3", "r3k2r/p1pq1pb1/bn1ppnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w kq - 2 3", "r3k2r/p1p1qpb1/1n1ppnp1/1b1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w kq - 0 3", "r3k2r/p1pnqpb1/b2ppnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w kq - 2 3", "r3k2r/p1pnqpb1/bn1pp1p1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R4RK1 w kq - 2 3"]], ["r3k2r/8/8/8/8/8/8/R4RK1 b kq - 1 1", ["r2k3r/8/8/8/8/8/8/R4RK1 w - - 2 2", "r6r/3k4/8/8/8/8/8/R4RK1 w - - 2 2", "r6r/4k3/8/8/8/8/8/R4RK1 w - - 2 2", "2kr3r/8/8/8/8/8/8/R4RK1 w - - 2 2", "1r2k2r/8/8/8/8/8/8/R4RK1 w k - 2 2", "2r1k2r/8/8/8/8/8/8/R4RK1 w k - 2 2", "3rk2r/8/8/8/8/8/8/R4RK1 w k - 2 2", "4k2r/r7/8/8/8/8/8/R4RK1 w k - 2 2", "4k2r/8/r7/8/8/8/8/R4RK1 w k - 2 2", "4k2r/8/8/r7/8/8/8/R4RK1 w k - 2 2", "4k2r/8/8/8/r7/8/8/R4RK1 w k - 2 2", "4k2r/8/8/8/8/r7/8/R4RK1 w k - 2 2", "4k2r/8/8/8/8/8/r7/R4RK1 w k - 2 2", "4k2r/8/8/8/8/8/8/r4RK1 w k - 0 2", "r3k1r1/8/8/8/8/8/8/R4RK1 w q - 2 2", "r3kr2/8/8/8/8/8/8/R4RK1 w q - 2 2", "r3k3/7r/8/8/8/8/8/R4RK1 w q - 2 2", "r3k3/8/7r/8/8/8/8/R4RK1 w q - 2 2", "r3k3/8/8/7r/8/8/8/R4RK1 w q - 2 2", "r3k3/8/8/8/7r/8/8/R4RK1 w q - 2 2", "r3k3/8/8/8/8/7r/8/R4RK1 w q - 2 2", "r3k3/8/8/8/8/8/7r/R4RK1 w q - 2 2", "r3k3/8/8/8/8/8/8/R4RKr w q - 2 2"]], ["r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1", ["r3k2r/8/8/8/8/8/8/R4K1R b kq - 1 1", "r3k2r/8/8/8/8/8/8/R2K3R b kq - 1 1", "r3k2r/8/8/8/8/8/8/R4RK1 b kq - 1 1", "r3k2r/8/8/8/8/8/8/2KR3R b kq - 1 1", "r3k2r/8/8/8/8/8/3K4/R6R b kq - 1 1", "r3k2r/8/8/8/8/8/4K3/R6R b kq - 1 1", "r3k2r/8/8/8/8/8/5K2/R6R b kq - 1 1", "r3k2r/8/8/8/8/8/8/1R2K2R b Kkq - 1 1", "r3k2r/8/8/8/8/8/8/2R1K2R b Kkq - 1 1", "r3k2r/8/8/8/8/8/8/3RK2R b Kkq - 1 1", "r3k2r/8/8/8/8/8/R7/4K2R b Kkq - 1 1", "r3k2r/8/8/8/8/R7/8/4K2R b Kkq - 1 1", "r3k2r/8/8/8/R7/8/8/4K2R b Kkq - 1 1", "r3k2r/8/8/R7/8/8/8/4K2R b Kkq - 1 1", "r3k2r/8/R7/8/8/8/8/4K2R b Kkq - 1 1", "r3k2r/R7/8/8/8/8/8/4K2R b Kkq - 1 1", "R3k2r/8/8/8/8/8/8/4K2R b Kk - 0 1", "r3k2r/8/8/8/8/8/8/R3K1R1 b Qkq - 1 1", "r3k2r/8/8/8/8/8/8/R3KR2 b Qkq - 1 1", "r3k2r/8/8/8/8/8/7R/R3K3 b Qkq - 1 1", "r3k2r/8/8/8/8/7R/8/R3K3 b Qkq - 1 1", "r3k2r/8/8/8/7R/8/8/R3K3 b Qkq - 1 1", "r3k2r/8/8/7R/8/8/8/R3K3 b Qkq - 1 1", "r3k2r/8/7R/8/8/8/8/R3K3 b Qkq - 1 1", "r3k2r/7R/8/8/8/8/8/R3K3 b Qkq - 1 1", "r3k2R/8/8/8/8/8/8/R3K3 b Qq - 0 1"]], ["4k2R/8/8/8/8/8/8/4K3 b - - 1 1", ["7R/5k2/8/8/8/8/8/4K3 w - - 2 2", "7R/4k3/8/8/8/8/8/4K3 w - - 2 2", "7R/3k4/8/8/8/8/8/4K3 w - - 2 2"]], ["4b2k/pppppppp/8/8/8/8/8/4K3 b - - 1 1", ["4b1k1/pppppppp/8/8/8/8/8/4K3 w - - 2 2", "4b2k/1ppppppp/p7/8/8/8/8/4K3 w - - 0 2", "4b2k/p1pppppp/1p6/8/8/8/8/4K3 w - - 0 2", "4b2k/pp1ppppp/2p5/8/8/8/8/4K3 w - - 0 2", "4b2k/ppp1pppp/3p4/8/8/8/8/4K3 w - - 0 2", "4b2k/pppp1ppp/4p3/8/8/8/8/4K3 w - - 0 2", "4b2k/ppppp1pp/5p2/8/8/8/8/4K3 w - - 0 2", "4b2k/pppppp1p/6p1/8/8/8/8/4K3 w - - 0 2", "4b2k/ppppppp1/7p/8/8/8/8/4K3 w - - 0 2", "4b2k/1ppppppp/8/p7/8/8/8/4K3 w - a6 0 2", "4b2k/p1pppppp/8/1p6/8/8/8/4K3 w - b6 0 2", "4b2k/pp1ppppp/8/2p5/8/8/8/4K3 w - c6 0 2", "4b2k/ppp1pppp/8/3p4/8/8/8/4K3 w - d6 0 2", "4b2k/pppp1ppp/8/4p3/8/8/8/4K3 w - e6 0 2", "4b2k/ppppp1pp/8/5p2/8/8/8/4K3 w - f6 0 2", "4b2k/pppppp1p/8/6p1/8/8/8/4K3 w - g6 0 2", "4b2k/ppppppp1/8/7p/8/8/8/4K3 w - h6 0 2"]], ["r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", ["1r2k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQk - 2 2", "2r1k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQk - 2 2", "3rk2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQk - 2 2", "r3k1r1/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2", "r3kr2/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpbr/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpb1/bn2pnpr/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpb1/bn2pnp1/3P3r/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2", "r3k3/p1ppqpb1/bn2pnp1/3P4/1p2P1Nr/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2", "r2k3r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2", "r4k1r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2", "2kr3r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2", "r4rk1/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2", "r2qk2r/p1pp1pb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3kq1r/p1pp1pb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1pp1pb1/bn1qpnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1pp1pb1/bn2pnp1/2qP4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r1b1k2r/p1ppqpb1/1n2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/pbppqpb1/1n2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/1b1P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/3P4/1pb1P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/3P4/1p2P1N1/2Nb1Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/1n2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBbPPP/R3K2R w KQkq - 0 2", "r3kb1r/p1ppqp2/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqp2/bn2pnpb/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r1n1k2r/p1ppqpb1/b3pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/b3pnp1/3n4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/b3pnp1/3P4/1pn1P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/b3pnp1/3P4/np2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k1nr/p1ppqpb1/bn2p1p1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpbn/bn2p1p1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/bn2p1p1/3P3n/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2", "r3k2r/p1ppqpb1/bn2p1p1/3P4/1p2P1n1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2p1p1/3P4/1p2n1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2p1p1/3n4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3P4/4P1N1/1pN2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3P4/4P1N1/2p2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p2pqpb1/bnp1pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p2pqpb1/bn2pnp1/2pP4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq c6 0 2", "r3k2r/p1p1qpb1/bn1ppnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn3np1/3p4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn3np1/3Pp3/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pn2/3P2p1/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2", "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q2/PPPBBPpP/R3K2R w KQkq - 0 2"]], ["r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1", ["r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/1R2K2R b Kkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/2R1K2R b Kkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/3RK2R b Kkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K1R1 b Qkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3KR2 b Qkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R2K3R b kq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R4K1R b kq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/2KR3R b kq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R4RK1 b kq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N1Q2p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2NQ3p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N3Qp/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N4Q/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2PQ2/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PNQ2/1p2P3/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pQp1/3PN3/1p2P3/2N4p/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P1Q1/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN2Q/1p2P3/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPP1BPPP/R1B1K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N1BQ1p/PPP1BPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2PB2/2N2Q1p/PPP1BPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN1B1/1p2P3/2N2Q1p/PPP1BPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnpB/3PN3/1p2P3/2N2Q1p/PPP1BPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3KB1R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R2BK2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2NB1Q1p/PPPB1PPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1pB1P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/Bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/5Q1p/PPPBBPPP/RN2K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/5Q1p/PPPBBPPP/R2NK2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Np2P3/5Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/1N1PN3/1p2P3/5Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P3/2NN1Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3P4/1pN1P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bnN1pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1", "r3k2r/p1ppqpb1/bn2pnN1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1pNqpb1/bn2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqNb1/bn2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/P1N2Q1p/1PPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/1PN2Q1p/P1PBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn1Ppnp1/4N3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2Pnp1/4N3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2QPp/PPPBBP1P/R3K2R b KQkq - 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P1P1/2N2Q1p/PPPBBP1P/R3K2R b KQkq g3 0 1", "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1P/PPPBBP1P/R3K2R b KQkq - 0 1"]]];
    _results = [];
    for (_i = 0, _len = testVector.length; _i < _len; _i++) {
      _ref = testVector[_i], startPositionString = _ref[0], expectedEndPositionStrings = _ref[1];
      positionObj = positionClass.fromString(startPositionString);
      LOG_MOVE_TEST('Start = ' + startPositionString);
      LOG_MOVE_TEST('Expected: ');
      for (_j = 0, _len2 = expectedEndPositionStrings.length; _j < _len2; _j++) {
        eps = expectedEndPositionStrings[_j];
        LOG_MOVE_TEST(eps);
      }
      LOG_MOVE_TEST('Calculated: ');
      calculatedMoves = positionObj.allPossibleMoves();
      calculatedEndPositionStrings = [];
      for (_k = 0, _len3 = calculatedMoves.length; _k < _len3; _k++) {
        calculatedMove = calculatedMoves[_k];
        LOG_MOVE_TEST(calculatedMove.getNewPosition().toString());
        calculatedEndPositionStrings.push(calculatedMove.getNewPosition().toString());
      }
      result = compareArrays(expectedEndPositionStrings, calculatedEndPositionStrings);
      _results.push(assert.eql([[], []], result));
    }
    return _results;
  },
  'test division': function(beforeExit, assert) {
    var calculatedMoveObj, calculatedMoveString, calculatedMoves, calculatedQuantity, counters, depth, expectedData, expectedMove, expectedQuantity, moveCount, moveId, newDepth, position, positionString, testVector, _i, _j, _len, _len2, _ref, _ref2, _results;
    if (!DO_DIVISION_TEST) return;
    testVector = require("../test-data/division-test");
    _results = [];
    for (_i = 0, _len = testVector.length; _i < _len; _i++) {
      _ref = testVector[_i], positionString = _ref[0], depth = _ref[1], expectedData = _ref[2];
      LOG_DIVISION_TEST("Verifying \"" + positionString + "\":");
      position = positionClass.fromString(positionString);
      calculatedMoves = {};
      moveCount = 0;
      _ref2 = position.allPossibleMoves();
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        calculatedMoveObj = _ref2[_j];
        calculatedMoveString = calculatedMoveObj.toString();
        assert.isDefined(expectedData[calculatedMoveString], "Unexpected move " + calculatedMoveString + " from position " + positionString);
        calculatedMoves[calculatedMoveString] = calculatedMoveObj;
        moveCount++;
      }
      moveId = 0;
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (expectedMove in expectedData) {
          expectedQuantity = expectedData[expectedMove];
          moveId++;
          LOG_DIVISION_TEST("  * move " + moveId + " of " + moveCount + " (" + (expectedMove.toString()) + ")");
          assert.isDefined(calculatedMoves[expectedMove], "Uncalculated move " + expectedMove + " from position " + positionString);
          if (depth === 1) continue;
          newDepth = depth - 1;
          counters = getInitialCounterArray(newDepth);
          testDepth(calculatedMoves[expectedMove].getNewPosition(), counters, 0, newDepth);
          calculatedQuantity = counters[newDepth - 1];
          _results2.push(assert.eql(calculatedQuantity, expectedQuantity, "Unexpected quantity for move " + expectedMove + " from position " + positionString + ": is " + calculatedQuantity + ", expected " + expectedQuantity));
        }
        return _results2;
      })());
    }
    return _results;
  },
  'test perftsuite.txt': function(beforeExit, assert) {
    var fs, iLine, nbLines, testFile, testLine;
    if (!DO_PERFTSUITE) return;
    fs = require('fs');
    nbLines = 0;
    iLine = 0;
    testLine = function(line) {
      var counter, counterId, counters, elems, expectedQuantity, maxDepth, positionObj, positionString, _len;
      iLine++;
      elems = line.split(' ;');
      positionString = elems.shift();
      LOG_PERFTSUITE("Verifying line " + iLine + " of " + nbLines + " (" + positionString + "):");
      positionObj = positionClass.fromString(positionString);
      assert.eql(positionString, positionObj.toString());
      maxDepth = DEPTH;
      if (elems.length < maxDepth) maxDepth = elem.length;
      counters = getInitialCounterArray(maxDepth);
      testDepth(positionObj, counters, 0, maxDepth, true);
      for (counterId = 0, _len = counters.length; counterId < _len; counterId++) {
        counter = counters[counterId];
        expectedQuantity = parseInt(elems[counterId].split(' ')[1]);
        assert.eql(counter, expectedQuantity);
      }
      LOG_PERFTSUITE("Position OK at depth " + maxDepth + ".");
      return LOG_PERFTSUITE("");
    };
    testFile = function(err, data) {
      var line, lineId, lines, _len;
      if (err) {
        console.log(err);
        return;
      }
      lines = data.split("\n");
      for (lineId = 0, _len = lines.length; lineId < _len; lineId++) {
        line = lines[lineId];
        line = trimString(line);
        if (line === '') lines.splice(lineId, 1);
      }
      nbLines = lines.length;
      lines.map(testLine);
      return LOG_PERFTSUITE("All positions OK up to depth " + DEPTH + ".");
    };
    return fs.readFile('./test-data/perftsuite.txt', 'utf8', testFile);
  }
};
