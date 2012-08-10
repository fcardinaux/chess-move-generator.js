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
      console.log(positionString);
      posObj = positionClass.fromString(positionString);
      console.log(posObj);
      assert.eql(true, posObj instanceof positionClass);
      newPositionString = posObj.toString();
      console.log(newPositionString);
      _results.push(assert.eql(positionString, newPositionString));
    }
    return _results;
  }
};
