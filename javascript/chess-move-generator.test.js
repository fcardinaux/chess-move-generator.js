/*
Chess Move Generator: Unit tests
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md

About Expresso: http://visionmedia.github.com/expresso/
*/
module.exports = {
  'test CMGPosition#fromString': function(beforeExit, assert) {
    var chessMoveGenerator, newPositionString, posObj, positionClass, positionString, positionStrings, _i, _len, _results;
    chessMoveGenerator = require('./chess-move-generator');
    positionClass = chessMoveGenerator.position;
    positionStrings = ["rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 0", "8/2p5/K2p4/1P5r/1R3p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/1P5r/KR3p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/R4p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/2R2p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/3R1p1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/4Rp1k/8/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/5R1k/8/4P1P1/8 b - - 0 0", "8/2p5/3p4/KP5r/5p1k/1R6/4P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/5p1k/8/1R2P1P1/8 b - - 1 0", "8/2p5/3p4/KP5r/5p1k/8/4P1P1/1R6 b - - 1 0", "8/2p5/3p4/KP5r/1R3p1k/4P3/6P1/8 b - - 0 0", "8/2p5/3p4/KP5r/1R2Pp1k/8/6P1/8 b - e3 0 0", "8/2p5/3p4/KP5r/1R3p1k/6P1/4P3/8 b - - 0 0", "8/2p5/3p4/KP5r/1R3pPk/8/4P3/8 b - g3 0 0"];
    _results = [];
    for (_i = 0, _len = positionStrings.length; _i < _len; _i++) {
      positionString = positionStrings[_i];
      posObj = positionClass.fromString(positionString);
      assert.eql(true, posObj instanceof positionClass);
      newPositionString = posObj.toString();
      _results.push(assert.eql(positionString, newPositionString));
    }
    return _results;
  },
  'test CMGPosition#_allowedCastlingValueToString': function(beforeExit, assert) {
    var chessMoveGenerator, positionClass;
    chessMoveGenerator = require('./chess-move-generator');
    positionClass = chessMoveGenerator.position;
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
    var chessMoveGenerator, positionClass;
    chessMoveGenerator = require('./chess-move-generator');
    positionClass = chessMoveGenerator.position;
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
    var chessMoveGenerator, colorCode, positionClass, positionObj, positionString, testData, _i, _len, _ref, _results;
    chessMoveGenerator = require('./chess-move-generator');
    positionClass = chessMoveGenerator.position;
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
    var chessMoveGenerator, colorCode, positionClass, positionObj, positionString, testData, _i, _len, _ref, _results;
    chessMoveGenerator = require('./chess-move-generator');
    positionClass = chessMoveGenerator.position;
    testData = [['b', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"], ['w', "4k3/8/R7/8/7b/8/3P4/7K b - - 33 32"], ['w', "rn2k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/R3K2R b Kq e3 3 12"], ['b', "r3k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/RN2K2R w Qk e6 3 12"]];
    _results = [];
    for (_i = 0, _len = testData.length; _i < _len; _i++) {
      _ref = testData[_i], colorCode = _ref[0], positionString = _ref[1];
      positionObj = positionClass.fromString(positionString);
      _results.push(assert.eql(colorCode, positionObj.opponentColorCode()));
    }
    return _results;
  }
};
