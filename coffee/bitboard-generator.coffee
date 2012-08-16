###
Chess Bitboard Generator
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Description
===========

This script generates another one with all necessary bitboards for the chess move generator.

Licence
=======

see README.md

Reminders
=========

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


Todos
=====

* Operations of loadMoves, loadPawnNonTakingMoves, loadPawnTakingMoves and loadShadows can be done in one loop block

Definitions
===========

* "Pseudo-legal moves are all moves that follows the basic move rules.
  I.e. the move does not take the piece off the board, or captures own pieces.
  But it might leave the own king in check, castle while in check
  or castle over a checked square." ( -> Jonatan Pettersson's Move generation)
###

# =============================================================================
# Movements of the different piece types

queenBitBoardStringArray = [
    '100000010000001',
    '010000010000010',
    '001000010000100',
    '000100010001000',
    '000010010010000',
    '000001010100000',
    '000000111000000',
    '111111101111111',
    '000000111000000',
    '000001010100000',
    '000010010010000',
    '000100010001000',
    '001000010000100',
    '010000010000010',
    '100000010000001'
]

rookBitBoardStringArray = [
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '111111101111111',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000',
    '000000010000000'
]

bishopBitBoardStringArray = [
    '100000000000001',
    '010000000000010',
    '001000000000100',
    '000100000001000',
    '000010000010000',
    '000001000100000',
    '000000101000000',
    '000000000000000',
    '000000101000000',
    '000001000100000',
    '000010000010000',
    '000100000001000',
    '001000000000100',
    '010000000000010',
    '100000000000001'
]

knightBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000101000000',
    '000001000100000',
    '000000000000000',
    '000001000100000',
    '000000101000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000'
]

kingBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000111000000',
    '000000101000000',
    '000000111000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000'
]

pawnMoveBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000010000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000'
]

pawnStartingMoveBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000010000000',
    '000000010000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000'
]

pawnTakeBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000101000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000',
    '000000000000000'
]

# =============================================================================
# Eight different shadows

shadowBitBoardStringArrays = [
    [
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000'
    ],
    [
        '000000000000001',
        '000000000000010',
        '000000000000100',
        '000000000001000',
        '000000000010000',
        '000000000100000',
        '000000001000000',
        '000000010000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000'
    ],
    [
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000011111111',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000'
    ],
    [
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000010000000',
        '000000001000000',
        '000000000100000',
        '000000000010000',
        '000000000001000',
        '000000000000100',
        '000000000000010',
        '000000000000001'
    ],
    [
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000',
        '000000010000000'
    ],
    [
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000010000000',
        '000000100000000',
        '000001000000000',
        '000010000000000',
        '000100000000000',
        '001000000000000',
        '010000000000000',
        '100000000000000'
    ],
    [
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '111111110000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000'
    ],
    [
        '100000000000000',
        '010000000000000',
        '001000000000000',
        '000100000000000',
        '000010000000000',
        '000001000000000',
        '000000100000000',
        '000000010000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000',
        '000000000000000'
    ]
]

# =============================================================================
# Exported function

module.exports.generateJavascriptLines = (dataPrefix, headerLine = '') ->
    lines = []

    if headerLine isnt ''
        lines.push("// #{headerLine}")

    moves = loadMoves(queenBitBoardStringArray)
    lines.push("#{dataPrefix}QUEEN_MOVES = #{quadrantRepresentation(moves)};")

    moves = loadMoves(rookBitBoardStringArray)
    lines.push("#{dataPrefix}ROOK_MOVES = #{quadrantRepresentation(moves)};")

    moves = loadMoves(bishopBitBoardStringArray)
    lines.push("#{dataPrefix}BISHOP_MOVES = #{quadrantRepresentation(moves)};")

    moves = loadMoves(knightBitBoardStringArray)
    lines.push("#{dataPrefix}KNIGHT_MOVES = #{quadrantRepresentation(moves)};")

    moves = loadMoves(kingBitBoardStringArray)
    lines.push("#{dataPrefix}KING_MOVES_WITHOUT_CASTLING = #{quadrantRepresentation(moves)};")

    moves =
        b: loadPawnNonTakingMoves('b')
        w: loadPawnNonTakingMoves('w')
    lines.push("#{dataPrefix}PAWN_NON_TAKING_MOVES = {\n    b: #{quadrantRepresentation(moves['b'])}, \n    w: #{quadrantRepresentation(moves['w'])}\n};")

    moves =
        b: loadPawnTakingMoves('b')
        w: loadPawnTakingMoves('w')
    lines.push("#{dataPrefix}PAWN_TAKING_MOVES = {\n    b: #{quadrantRepresentation(moves['b'])}, \n    w: #{quadrantRepresentation(moves['w'])}\n};")

    shadows = loadShadows()
    lines.push("#{dataPrefix}SHADOWS = #{quadrantRepresentation(shadows)};")

    return lines

quadrantRepresentation = (moves) ->
    #"[#{moves[0]}, #{moves[1]}, #{moves[2]}, #{moves[3]}]"
    JSON.stringify(moves)

# =============================================================================
# Load actual movement bitboards

bitBoardStringArrayToIntegers = (bitBoardStringArray, offsetY, offsetX, trace = false) ->
    # First, determine the 8x8 square that represents the bitboard
    if trace
        console.log('offsetY: ' + offsetY)
        console.log('offsetX: ' + offsetX)
    start = 7 - offsetY
    rectangle_15_8 = bitBoardStringArray.slice(start)
    if start < 7
        rectangle_15_8 = rectangle_15_8.slice(0, 8) # Remember: slice ends at 8 - 1 = 7

    if trace
        console.log(rectangle_15_8)

    square_8_8 = []
    for line_15_8 in rectangle_15_8
        square_8_8.push(line_15_8.substr(offsetX, 8))

    if trace
        console.log(square_8_8)

    # Second, split the bitboard into four quadrants
    topLeft = []
    topRight = []
    bottomLeft = []
    bottomRight = []
    for line, lineId in square_8_8
        if lineId < 4
            topLeft.push(line.substr(0, 4))
            topRight.push(line.substr(4))
        else
            bottomLeft.push(line.substr(0, 4))
            bottomRight.push(line.substr(4))

    # Finally, return the four quadrants as an array of four integers
    out = [
        parseInt(bottomLeft.join(''), 2),
        parseInt(bottomRight.join(''), 2),
        parseInt(topLeft.join(''), 2),
        parseInt(topRight.join(''), 2)
    ]

    if trace
        console.log(out)
        exit

    return out

loadMoves = (bitBoardStringArray) ->
    out = []

    for iRow in [7..0]      # 1 .. 8
        for iCol in [7..0]  # A .. H
            out.push(bitBoardStringArrayToIntegers( bitBoardStringArray, iRow, iCol ))

    return out

loadPawnNonTakingMoves = (color) ->
    if color is 'w'
        arrayOp = (arr) -> arr
    else
        arrayOp = (arr) -> arr.reverse()

    ordinaryMoveArr = arrayOp(pawnMoveBitBoardStringArray)
    if color is 'b'
        row2MoveArr = arrayOp(pawnMoveBitBoardStringArray)
        row7MoveArr = arrayOp(pawnStartingMoveBitBoardStringArray)
    else
        row2MoveArr = arrayOp(pawnStartingMoveBitBoardStringArray)
        row7MoveArr = arrayOp(pawnMoveBitBoardStringArray)

    out = []

    for iRow in [6..1]      # 2 .. 7
        for iCol in [7..0]  # A .. H
            switch iRow
                when 6 then out.push(bitBoardStringArrayToIntegers( row2MoveArr, iRow, iCol ))
                when 1 then out.push(bitBoardStringArrayToIntegers( row7MoveArr, iRow, iCol ))
                else        out.push(bitBoardStringArrayToIntegers( ordinaryMoveArr, iRow, iCol ))

    return out

loadPawnTakingMoves = (color) ->
    if color is 'w'
        arrayOp = (arr) -> arr
    else
        arrayOp = (arr) -> arr.reverse()

    takingMoveArr = arrayOp(pawnTakeBitBoardStringArray)

    out = []

    for iRow in [6..1]      # 2 .. 7
        for iCol in [7..0]  # A .. H
            out.push(bitBoardStringArrayToIntegers( takingMoveArr, iRow, iCol ))

    return out

# =============================================================================
# Load actual shadow and light bitboards

loadShadows = () ->
    out = []

    for iRow in [7..0]      # 1 .. 8
        for iCol in [7..0]  # A .. H
            shadows = []
            for iDirection in [0..7] # 0 = north, 1 = north-east, ..., 7 = north-west (i.e. clockwise)
                shadows.push(bitBoardStringArrayToIntegers( shadowBitBoardStringArrays[iDirection], iRow, iCol ))
            out.push(shadows)

    return out

