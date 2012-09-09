###
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
###

# =============================================================================

# Profiling with nodetime:
# todo remove completely: require('nodetime').profile()

# =============================================================================

# Set the performance test depth here
DO_ELEMENTARY_TESTS = true
DO_POSSIBLE_MOVE_TEST = false
DO_DIVISION_TEST = false
DO_PERFTSUITE = false
DEPTH = 6

LOG_ELEMENTARY_TEST = (x) ->
    # console.log(x)

LOG_MOVE_TEST = (x) ->
    # console.log(x)

LOG_DIVISION_TEST = (x) ->
    console.log(x)

LOG_PERFTSUITE = (x) ->
    console.log(x)

# =============================================================================

chessMoveGenerator = require('../javascript/chess-move-generator')
positionClass = chessMoveGenerator.position
bitBoardClass = chessMoveGenerator.bitBoard
utilityClass  = chessMoveGenerator.utility

# =============================================================================

getInitialCounterArray = (maxDepth) ->
    counters = []
    for iDepth in [0..(maxDepth-1)]
        counters.push(0)
    counters

testDepth = (positionObj, counters, currentDepth, maxDepth, logFunction = false) ->

    moves = positionObj.allPossibleMoves()
    moveQuantity = moves.length

    counters[currentDepth] += moveQuantity

    currentDepth++
    if currentDepth >= maxDepth
        return true

    for move, moveId in moves
        logFunction("  * testing move #{(moveId+1)} of #{moveQuantity} (#{move.toString()})") if logFunction
        pos = move.getNewPosition().clone(false, true) # With the lazy object
        testDepth(pos, counters, currentDepth, maxDepth)
        move = null
        delete move
        pos = null
        delete pos

    # Avoid too many allocations
    moves = null
    delete moves

    return true

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

module.exports =
    'test CMGBitBoard#valueOfSquare': (beforeExit, assert) ->

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing bitboard values of squares')

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

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing string to and from position object')

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

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing allowed castling values to string')

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

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing allowed castling values from string')

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

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing player color code')

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

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing opponent color code')

        testData = [
            ['b', "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"],
            ['w', "4k3/8/R7/8/7b/8/3P4/7K b - - 33 32"],
            ['w', "rn2k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/R3K2R b Kq e3 3 12"],
            ['b', "r3k2r/pppppppp/8/8/1P1P1P1P/8/P1P1P1P1/RN2K2R w Qk e6 3 12"]
        ]
        for [colorCode, positionString] in testData
            positionObj = positionClass.fromString(positionString)
            assert.eql(colorCode, positionObj.opponentColorCode())

    'test CMGUtil#0x88representation': (beforeExit, assert) ->

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing square key conversion to and from 0x88 representation')

        square0x88values  = [0,   1,   2,   3,   4,   5,   6,   7,  16,  17,  18,  19,  20,  21,  22,  23,  32,  33,  34,  35,  36,  37,  38,  39,  48,  49,  50,  51,  52,  53,  54,  55,  64,  65,  66,  67,  68,  69,  70,  71,  80,  81,  82,  83,  84,  85,  86,  87,  96,  97,  98,  99, 100, 101, 102, 103, 112, 113, 114, 115, 116, 117, 118, 119]

        for squareKey in [0..63]
            square0x88value = utilityClass.to0x88representation(squareKey)
            assert.eql(square0x88value, square0x88values[squareKey], "0x88 representation of #{squareKey} should be #{square0x88values[squareKey]} and not #{square0x88value}.")
            returnedKey     = utilityClass.from0x88representation(square0x88value)
            assert.eql(squareKey, returnedKey, "Square key of #{squareKey} has 0x88 representation #{square0x88value}, which is incorrectly converted back to #{returnedKey}.")

    'test CMGPosition#isDraw': (beforeExit, assert) ->

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing if specific positions are draw')

        draws = ['4k3/4P3/4K3/8/8/8/8/8 b - - 1 1']

        for draw in draws
            pos = positionClass.fromString(draw)
            assert.eql(true, pos.isDraw(), "Position #{draw} was supposed to be a draw, but isnt.")

        nonDraws = ['4k3/4P3/4K3/8/8/8/8/8 w - - 1 1']

        for nonDraw in nonDraws
            pos = positionClass.fromString(nonDraw)
            assert.eql(false, pos.isDraw(), "Position #{nonDraw} was supposed NOT to be a draw, but is.")

    'test CMGPosition#getWinnerColorCode': (beforeExit, assert) ->

        if not DO_ELEMENTARY_TESTS
            return

        LOG_ELEMENTARY_TEST('Testing if specific positions are losing')

        losingPositions = ['4k3/4Q3/4K3/8/8/8/8/8 b - - 1 1']

        for losingPosition in losingPositions
            pos = positionClass.fromString( losingPosition )
            assert.eql('w', pos.getWinnerColorCode(), "Position #{losingPosition} was supposed to be losing, but isnt.")

        notLosingPositions = ['4k3/4P3/4K3/8/8/8/8/8 w - - 1 1']

        for notLosingPosition in notLosingPositions
            pos = positionClass.fromString(notLosingPosition)
            assert.eql(false, pos.getWinnerColorCode(), "Position #{notLosingPosition} was supposed NOT to be losing, but is.")

    'test CMGPosition#allPossibleMoves': (beforeExit, assert) ->

        if not DO_POSSIBLE_MOVE_TEST
            return

        LOG_MOVE_TEST('Testing all possible moves from given positions')

        testVector = require("../test-data/next-position-test") # .json omitted

        for [startPositionString, expectedEndPositionStrings] in testVector
            positionObj = positionClass.fromString(startPositionString)

            LOG_MOVE_TEST('Start = ' + startPositionString)
            LOG_MOVE_TEST('Expected: ')
            for eps in expectedEndPositionStrings
                LOG_MOVE_TEST(eps)
            LOG_MOVE_TEST('Calculated: ')

            calculatedMoves = positionObj.allPossibleMoves()
            calculatedEndPositionStrings = []
            for calculatedMove in calculatedMoves
                calculatedEndPositionStrings.push( calculatedMove.getNewPosition().toString() )
            result = compareArrays expectedEndPositionStrings, calculatedEndPositionStrings

            assert.eql([[], []], result)

    'test division': (beforeExit, assert) ->

        if not DO_DIVISION_TEST
            return

        # todo exec = require('child_process').exec
        # todo fct = (error, stdout, stderr) ->
        # todo     console.log(stdout)
        # todo exec('ls', fct)

        testVector = require("../test-data/division-test") # .json omitted

        for [positionString, depth, expectedData] in testVector
            LOG_DIVISION_TEST("Verifying \"#{positionString}\" at depth #{depth}:")

            position = positionClass.fromString(positionString)

            calculatedMoves = {}
            calculatedMoves = position.allPossibleMoves()
            calculatedMoveQty = calculatedMoves.length
            for calculatedMoveObj, calculatedMoveId in calculatedMoves
                calculatedMoveString = calculatedMoveObj.toString()
                LOG_DIVISION_TEST("  * calculated move #{(calculatedMoveId+1)} of #{calculatedMoveQty} (#{calculatedMoveString})")
                assert.isDefined(expectedData[calculatedMoveString], "Unexpected move #{calculatedMoveString} from position #{positionString}")
                calculatedMoves[calculatedMoveString] = calculatedMoveObj

            moveId = 0
            for expectedMove, expectedQuantity of expectedData
                moveId++
                LOG_DIVISION_TEST("  * expected move #{moveId} (#{expectedMove.toString()})")

                assert.isDefined(calculatedMoves[expectedMove], "Uncalculated move #{expectedMove} from position #{positionString}")

                if depth is 1
                    continue # At depth 1, we do not calculate quantities

                newDepth = depth - 1 # remove 1 from depth because the first move is already performed at this level
                counters = getInitialCounterArray(newDepth)
                testDepth(calculatedMoves[expectedMove].getNewPosition(), counters, 0, newDepth)
                calculatedQuantity = counters[newDepth - 1]
                assert.eql(calculatedQuantity, expectedQuantity, "Unexpected quantity for move #{expectedMove} from position #{positionString}: is #{calculatedQuantity}, expected #{expectedQuantity}")

    'test perftsuite.txt': (beforeExit, assert) ->

        if not DO_PERFTSUITE
            return

        fs = require('fs');

        nbLines = 0
        iLine = 0

        testLine = (line) ->

            iLine++

            elems = line.split(' ;')
            positionString = elems.shift()

            LOG_PERFTSUITE("Verifying line #{iLine} of #{nbLines} (#{positionString}):")

            # Make sure the position string is correctly transformed into a position object
            positionObj = positionClass.fromString(positionString)
            assert.eql(positionString, positionObj.toString())

            # Adjust the maximal depth to the data quantity
            maxDepth = DEPTH
            if elems.length < maxDepth
                maxDepth = elem.length

            # Initialize the counters
            counters = getInitialCounterArray(maxDepth)

            # Count
            testDepth(positionObj, counters, 0, maxDepth, LOG_PERFTSUITE)

            # Now compare the counters to the expected result
            for counter, counterId in counters
                expectedQuantity = parseInt(elems[counterId].split(' ')[1])
                assert.eql(counter, expectedQuantity)

            LOG_PERFTSUITE("Position OK at depth #{maxDepth}.")
            LOG_PERFTSUITE("")

        testFile = (err, data) ->
            if err
                console.log(err)
                return

            lines = data.split("\n")

            for line, lineId in lines
                line = trimString line
                if line is ''
                    lines.splice(lineId, 1)

            nbLines = lines.length

            lines.map(testLine)

            LOG_PERFTSUITE("All positions OK up to depth #{DEPTH}.")

        fs.readFile('./test-data/perftsuite.txt', 'utf8', testFile)

