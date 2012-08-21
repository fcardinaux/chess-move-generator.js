###
Chess Move Generator: Unit tests
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md

About Expresso: http://visionmedia.github.com/expresso/
###

chessMoveGenerator = require('../javascript/chess-move-generator')
positionClass = chessMoveGenerator.position
bitBoardClass = chessMoveGenerator.bitBoard

# Set the performance test depth here
DEPTH = 1

LOG = (x) ->
    # console.log(x)

# http://stackoverflow.com/a/498995
trimString = (str) ->
    str.replace(/^\s\s*/, '').replace(/\s\s*$/, '')

compareArrays = (arr1, arr2) ->
    # Inpired by http://stackoverflow.com/a/3432978
    missingInArr1 = []
    missingInArr2 = []

    lookup1 = {}
    for elem1 in arr1
        lookup1[elem1] = elem1

    lookup2 = {}
    for elem2 in arr2
        lookup2[elem2] = elem2
        if typeof lookup1[elem2] is 'undefined'
            missingInArr1.push(elem2)

    for elem1 in arr1
        if typeof lookup2[elem1] is 'undefined'
            missingInArr2.push(elem1)

    return [missingInArr1, missingInArr2]

module.nonexports =
    'test CMGBitBoard#valueOfSquare': (beforeExit, assert) ->
        assert.eql([   0x0, 0x8000,    0x0,    0x0], bitBoardClass.valueOfSquare(31))

        assert.eql([   0x1,    0x0,    0x0,    0x0], bitBoardClass.valueOfSquare(0))
        assert.eql([  0x80,    0x0,    0x0,    0x0], bitBoardClass.valueOfSquare(7))
        assert.eql([ 0x100,    0x0,    0x0,    0x0], bitBoardClass.valueOfSquare(8))
        assert.eql([0x8000,    0x0,    0x0,    0x0], bitBoardClass.valueOfSquare(15))
        assert.eql([   0x0,    0x1,    0x0,    0x0], bitBoardClass.valueOfSquare(16))
        assert.eql([   0x0,   0x80,    0x0,    0x0], bitBoardClass.valueOfSquare(23))
        assert.eql([   0x0,  0x100,    0x0,    0x0], bitBoardClass.valueOfSquare(24))
        assert.eql([   0x0,    0x0,    0x1,    0x0], bitBoardClass.valueOfSquare(32))
        assert.eql([   0x0,    0x0,    0x0, 0x8000], bitBoardClass.valueOfSquare(63))

    'test CMGPosition#fromString': (beforeExit, assert) ->
        positionStrings = [
            "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
            "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 0",
            "8/2p5/K2p4/1P5r/1R3p1k/8/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/1P5r/KR3p1k/8/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/R4p1k/8/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/2R2p1k/8/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/3R1p1k/8/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/4Rp1k/8/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/5R1k/8/4P1P1/8 b - - 0 0",
            "8/2p5/3p4/KP5r/5p1k/1R6/4P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/5p1k/8/1R2P1P1/8 b - - 1 0",
            "8/2p5/3p4/KP5r/5p1k/8/4P1P1/1R6 b - - 1 0",
            "8/2p5/3p4/KP5r/1R3p1k/4P3/6P1/8 b - - 0 0",
            "8/2p5/3p4/KP5r/1R2Pp1k/8/6P1/8 b - e3 0 0",
            "8/2p5/3p4/KP5r/1R3p1k/6P1/4P3/8 b - - 0 0",
            "8/2p5/3p4/KP5r/1R3pPk/8/4P3/8 b - g3 0 0"
        ]
        for positionString in positionStrings
            posObj = positionClass.fromString(positionString)
            assert.eql(true, (posObj instanceof positionClass))
            newPositionString = posObj.toString()
            assert.eql(positionString, newPositionString)

    'test CMGPosition#_allowedCastlingValueToString': (beforeExit, assert) ->
        assert.eql("KQkq",  positionClass._allowedCastlingValueToString(15))
        assert.eql("KQk",   positionClass._allowedCastlingValueToString(14))
        assert.eql("KQq",   positionClass._allowedCastlingValueToString(13))
        assert.eql("KQ",    positionClass._allowedCastlingValueToString(12))
        assert.eql("Kkq",   positionClass._allowedCastlingValueToString(11))
        assert.eql("Kk",    positionClass._allowedCastlingValueToString(10))
        assert.eql("Kq",    positionClass._allowedCastlingValueToString( 9))
        assert.eql("K",     positionClass._allowedCastlingValueToString( 8))
        assert.eql("Qkq",   positionClass._allowedCastlingValueToString( 7))
        assert.eql("Qk",    positionClass._allowedCastlingValueToString( 6))
        assert.eql("Qq",    positionClass._allowedCastlingValueToString( 5))
        assert.eql("Q",     positionClass._allowedCastlingValueToString( 4))
        assert.eql("kq",    positionClass._allowedCastlingValueToString( 3))
        assert.eql("k",     positionClass._allowedCastlingValueToString( 2))
        assert.eql("q",     positionClass._allowedCastlingValueToString( 1))
        assert.eql("-",     positionClass._allowedCastlingValueToString( 0))

    'test CMGPosition#_allowedCastlingStringToValue': (beforeExit, assert) ->
        assert.eql(15,      positionClass._allowedCastlingStringToValue("KQkq"))
        assert.eql(14,      positionClass._allowedCastlingStringToValue("KQk"))
        assert.eql(13,      positionClass._allowedCastlingStringToValue("KQq"))
        assert.eql(12,      positionClass._allowedCastlingStringToValue("KQ"))
        assert.eql(11,      positionClass._allowedCastlingStringToValue("Kkq"))
        assert.eql(10,      positionClass._allowedCastlingStringToValue("Kk"))
        assert.eql( 9,      positionClass._allowedCastlingStringToValue("Kq"))
        assert.eql( 8,      positionClass._allowedCastlingStringToValue("K"))
        assert.eql( 7,      positionClass._allowedCastlingStringToValue("Qkq"))
        assert.eql( 6,      positionClass._allowedCastlingStringToValue("Qk"))
        assert.eql( 5,      positionClass._allowedCastlingStringToValue("Qq"))
        assert.eql( 4,      positionClass._allowedCastlingStringToValue("Q"))
        assert.eql( 3,      positionClass._allowedCastlingStringToValue("kq"))
        assert.eql( 2,      positionClass._allowedCastlingStringToValue("k"))
        assert.eql( 1,      positionClass._allowedCastlingStringToValue("q"))
        assert.eql( 0,      positionClass._allowedCastlingStringToValue("-"))

    'test CMGPosition#playerColorCode': (beforeExit, assert) ->
        testData = [
            ['w', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
            ['b', "4k3/8/R7/8/7b/8/3P4/7K b - - 33 32"],
            ['b', "rn2k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/R3K2R b Kq e3 3 12"],
            ['w', "r3k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/RN2K2R w Qk e6 3 12"]
        ]
        for [colorCode, positionString] in testData
            positionObj = positionClass.fromString(positionString)
            assert.eql(colorCode, positionObj.playerColorCode())

    'test CMGPosition#opponentColorCode': (beforeExit, assert) ->
        testData = [
            ['b', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
            ['w', "4k3/8/R7/8/7b/8/3P4/7K b - - 33 32"],
            ['w', "rn2k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/R3K2R b Kq e3 3 12"],
            ['b', "r3k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/RN2K2R w Qk e6 3 12"]
        ]
        for [colorCode, positionString] in testData
            positionObj = positionClass.fromString(positionString)
            assert.eql(colorCode, positionObj.opponentColorCode())

module.exports =
    'test CMGPosition#allPossibleMoves': (beforeExit, assert) ->
        testData = [
            [
                "4k2R/8/8/8/8/8/8/4K3 b - - 1 1",
                [
                    # King moves
                    "7R/5k2/8/8/8/8/8/4K3 w - - 2 2",
                    "7R/4k3/8/8/8/8/8/4K3 w - - 2 2",
                    "7R/3k4/8/8/8/8/8/4K3 w - - 2 2"
                ]
            ],
            [
                "4b2k/pppppppp/8/8/8/8/8/4K3 b - - 1 1",
                [
                    # King moves
                    "4b1k1/pppppppp/8/8/8/8/8/4K3 w - - 2 2",
                    # Pawn moves
                    "4b2k/1ppppppp/p7/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/p1pppppp/1p6/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/pp1ppppp/2p5/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/ppp1pppp/3p4/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/pppp1ppp/4p3/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/ppppp1pp/5p2/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/pppppp1p/6p1/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/ppppppp1/7p/8/8/8/8/4K3 w - - 0 2",
                    "4b2k/1ppppppp/8/p7/8/8/8/4K3 w - a6 0 2",
                    "4b2k/p1pppppp/8/1p6/8/8/8/4K3 w - b6 0 2",
                    "4b2k/pp1ppppp/8/2p5/8/8/8/4K3 w - c6 0 2",
                    "4b2k/ppp1pppp/8/3p4/8/8/8/4K3 w - d6 0 2",
                    "4b2k/pppp1ppp/8/4p3/8/8/8/4K3 w - e6 0 2",
                    "4b2k/ppppp1pp/8/5p2/8/8/8/4K3 w - f6 0 2",
                    "4b2k/pppppp1p/8/6p1/8/8/8/4K3 w - g6 0 2",
                    "4b2k/ppppppp1/8/7p/8/8/8/4K3 w - h6 0 2",
                ]
            ],
            [
                "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                [
                    # Rooks move
                    "1r2k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQk - 2 2",
                    "2r1k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQk - 2 2",
                    "3rk2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQk - 2 2",

                    "r3k1r1/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2",
                    "r3kr2/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2",
                    "r3k3/p1ppqpbr/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2",
                    "r3k3/p1ppqpb1/bn2pnpr/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2",
                    "r3k3/p1ppqpb1/bn2pnp1/3P3r/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2",
                    "r3k3/p1ppqpb1/bn2pnp1/3P4/1p2P1Nr/2N2Q1p/PPPBBPPP/R3K2R w KQq - 2 2",
                    # King moves
                    "r2k3r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2",
                    "r4k1r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2",
                    # Castling
                    "2kr3r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2",
                    "r4rk1/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQ - 2 2",
                    # Queen moves
                    "r2qk2r/p1pp1pb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3kq1r/p1pp1pb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1pp1pb1/bn1qpnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1pp1pb1/bn2pnp1/2qP4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    # Bishops move
                    "r1b1k2r/p1ppqpb1/1n2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/pbppqpb1/1n2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/1n2pnp1/1b1P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/1n2pnp1/3P4/1pb1P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/1n2pnp1/3P4/1p2P1N1/2Nb1Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/1n2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBbPPP/R3K2R w KQkq - 0 2",
                    "r3kb1r/p1ppqp2/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqp2/bn2pnpb/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    # Knights move
                    "r1n1k2r/p1ppqpb1/b3pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/b3pnp1/3n4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    "r3k2r/p1ppqpb1/b3pnp1/3P4/1pn1P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/b3pnp1/3P4/np2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k1nr/p1ppqpb1/bn2p1p1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpbn/bn2p1p1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/bn2p1p1/3P3n/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 2 2",
                    "r3k2r/p1ppqpb1/bn2p1p1/3P4/1p2P1n1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    "r3k2r/p1ppqpb1/bn2p1p1/3P4/1p2n1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    "r3k2r/p1ppqpb1/bn2p1p1/3n4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    # Pawns move
                    "r3k2r/p1ppqpb1/bn2pnp1/3P4/4P1N1/1pN2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    "r3k2r/p1ppqpb1/bn2pnp1/3P4/4P1N1/2p2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",

                    "r3k2r/p2pqpb1/bnp1pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    "r3k2r/p2pqpb1/bn2pnp1/2pP4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq c6 0 2",

                    "r3k2r/p1p1qpb1/bn1ppnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",

                    "r3k2r/p1ppqpb1/bn3np1/3p4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",
                    "r3k2r/p1ppqpb1/bn3np1/3Pp3/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",

                    "r3k2r/p1ppqpb1/bn2pn2/3P2p1/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 2",

                    "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q2/PPPBBPpP/R3K2R w KQkq - 0 2"
                ]
            ],
            [
                "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
                [
                    # Rooks move
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/1R2K2R b Kkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/2R1K2R b Kkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/3RK2R b Kkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K1R1 b Qkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3KR2 b Qkq - 1 1",
                    # King moves
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R2K3R b kq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R4K1R b kq - 1 1",
                    # Castling
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/2KR3R b kq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R4RK1 b kq - 1 1",
                    # Queen moves
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N1Q2p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2NQ3p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N3Qp/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N4Q/PPPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2PQ2/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PNQ2/1p2P3/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pQp1/3PN3/1p2P3/2N4p/PPPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P1Q1/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN2Q/1p2P3/2N4p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    # Bishops move
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPP1BPPP/R1B1K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N1BQ1p/PPP1BPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2PB2/2N2Q1p/PPP1BPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN1B1/1p2P3/2N2Q1p/PPP1BPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnpB/3PN3/1p2P3/2N2Q1p/PPP1BPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3KB1R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R2BK2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2NB1Q1p/PPPB1PPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1pB1P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/1B1PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/Bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPB1PPP/R3K2R b KQkq - 0 1",
                    # Knights move
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/5Q1p/PPPBBPPP/RN2K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/5Q1p/PPPBBPPP/R2NK2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Np2P3/5Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/1N1PN3/1p2P3/5Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P3/2NN1Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3P4/1pN1P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3P4/1p2P1N1/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bnN1pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 1 1",
                    "r3k2r/p1ppqpb1/bn2pnN1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1pNqpb1/bn2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqNb1/bn2pnp1/3P4/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1",
                    # Pawns move
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/P1N2Q1p/1PPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/Pp2P3/2N2Q1p/1PPBBPPP/R3K2R b KQkq a3 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/1PN2Q1p/P1PBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn1Ppnp1/4N3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn2Pnp1/4N3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2QPp/PPPBBP1P/R3K2R b KQkq - 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P1P1/2N2Q1p/PPPBBP1P/R3K2R b KQkq g3 0 1",
                    "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1P/PPPBBP1P/R3K2R b KQkq - 0 1"
                ]
            ]
        ]

        for [startPositionString, expectedEndPositionStrings] in testData
            positionObj = positionClass.fromString(startPositionString)

            LOG('Start = ' + startPositionString)
            LOG('Expected: ')
            for eps in expectedEndPositionStrings
                LOG(eps)
            LOG('Calculated: ')

            calculatedMoves = positionObj.allPossibleMoves()
            calculatedEndPositionStrings = []
            for calculatedMove in calculatedMoves
                LOG(calculatedMove.newPosition.toString())
                calculatedEndPositionStrings.push( calculatedMove.newPosition.toString() )
            result = compareArrays expectedEndPositionStrings, calculatedEndPositionStrings

            assert.eql([[], []], result)

    'test perftsuite.txt': (beforeExit, assert) ->
        fs = require('fs');

        testDepth = (positionObj, counters, currentDepth, maxDepth) ->
            moves = positionObj.allPossibleMoves()

            counters[currentDepth] += moves.length

            currentDepth++
            if currentDepth >= maxDepth
                return true

            for move in moves
                testDepth(move.newPosition, counters, currentDepth + 1, maxDepth)

            return true

        testLine = (line) ->
            line = trimString line
            if line is ''
                return
            elems = line.split(' ;')
            positionString = elems.shift()

            # Make sure the position string is correctly transformed into a position object
            positionObj = positionClass.fromString(positionString)
            assert.eql(positionString, positionObj.toString())

            # Adjust the maximal depth to the data quantity
            maxDepth = DEPTH
            if elems.length < maxDepth
                maxDepth = elem.length

            # Initialize the counters
            counters = []
            iDepth = 0
            while iDepth < maxDepth
                counters.push(0)
                iDepth++

            # Count
            testDepth(positionObj, counters, 0, maxDepth)

            # Now compare the counters to the expected result
            for counter, counterId in counters
                expectedQuantity = parseInt(elems[counterId].split(' ')[1])
                assert.eql(counter, expectedQuantity)

        testFile = (err, data) ->
            if err
                console.log(err)
                return

            lines = data.split("\n")

            lines.map(testLine)

        fs.readFile('./test-data/perftsuite.txt', 'utf8', testFile);

