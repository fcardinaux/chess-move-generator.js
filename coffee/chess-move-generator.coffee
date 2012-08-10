###
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

The board and the square codes in 0x88 representation:
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


Definitions:

* "Pseudo-legal moves are all moves that follows the basic move rules.
  I.e. the move does not take the piece off the board, or captures own pieces.
  But it might leave the own king in check, castle while in check
  or castle over a checked square." ( -> Jonatan Pettersson's Move generation)
###

queenBitBoardStringArrays = [
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

blackPawnMoveBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
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
    '000000000000000'
]

whitePawnMoveBitBoardStringArray = [
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

blackPawnStartingMoveBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
    '000000000000000',
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
    '000000000000000'
]

whitePawnStartingMoveBitBoardStringArray = [
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

blackPawnTakeBitBoardStringArray = [
    '000000000000000',
    '000000000000000',
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
    '000000000000000'
]

whitePawnTakeBitBoardStringArray = [
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

bitBoardStringArrayToIntegers = (bitBoardStringArray, offsetY, offsetX) ->
    # First, determine the 8x8 square that represents the bitboard
    start = 7 - offsetY
    rectangle_16_8 = bitBoardStringArray.slice(start)
    if start < 7
        rectangle_16_8 = rectangle_16_8.slice(0, 8) # Remember: slice ends at 8 - 1 = 7
    square_8_8 = []
    for line_16_8 in rectangle_16_8
        square_8_8.push(line_16_8.substr(offsetX, 8))

    # Second, split the bitboard into four quadrants
    topLeft = topRight = bottomLeft = bottomRight = []
    for line, lineId in square_8_8
        if lineId < 4
            topLeft.push(line.substr(0, 4))
            topRight.push(line.substr(4))
        else
            bottomLeft.push(line.substr(0, 4))
            bottomRight.push(line.substr(4))

    # Finally, return the four quadrants as an array of four integers
    [
        parseInt(bottomLeft.join(''), 2),
        parseInt(bottomRight.join(''), 2),
        parseInt(topLeft.join(''), 2),
        parseInt(topRight.join(''), 2)
    ]

loadMoves = (bitBoardStringArray) ->
    [
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 7 ), # A1
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 7, 0 ), # H1

        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 7 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 6, 0 ),

        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 7 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 5, 0 ),

        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 7 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 4, 0 ),

        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 7 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 3, 0 ),

        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 7 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 2, 0 ),

        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 7 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 1, 0 ),

        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 7 ), # A8
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 6 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 5 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 4 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 3 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 2 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 1 ),
        bitBoardStringArrayToIntegers( bitBoardStringArray, 0, 0 )  # H8
        ]


class CMGPosition
    # Noticeable values in 0x88 representation:
    @ROW_SPAN:             16
    @MOVE_UP:              16
    @MOVE_UP_LEFT:         15
    @MOVE_UP_RIGHT:        17
    @MOVE_UP_2:            32
    @MOVE_DOWN:           -16
    @MOVE_DOWN_LEFT:      -17
    @MOVE_DOWN_RIGHT:     -15
    @MOVE_DOWN_2:         -32
    @BOTTOM_LEFT_CORNER:    0
    @BOTTOM_RIGHT_CORNER:   7
    @TOP_LEFT_CORNER:     112
    @TOP_RIGHT_CORNER:    119

    # Internal encoding for castling:
    @CASTLING_ALL:         15
    @CASTLING_WHITE_KING:   8
    @CASTLING_WHITE_QUEEN:  4
    @CASTLING_BLACK_KING:   2
    @CASTLING_BLACK_QUEEN:  1


    # Chess moves (with origin = H8)
    # * note that parseInt is the "simplest" way of representing binary numbers in JS
    # * queens, rooks, bishops and knight: independant of position
    @QUEEN_MOVES: loadMoves(queenBitBoardStringArray)
    @ROOK_MOVES: loadMoves(rookBitBoardStringArray)
    @BISHOP_MOVES: loadMoves(bishopBitBoardStringArray)
    @KNIGHT_MOVES: loadMoves(knightBitBoardStringArray)
    # * kings: ordinary moves (castling done separately)
    @KING_MOVES_WITHOUT_CASTLING: loadMoves(kingBitBoardStringArray)
    # * pawns: all ordinary moves, all 2-square initial moves, all promotions

    # -------------------------------------------------------------------------
    # Public functions of class (comparable to static methods)

    @fromString: (positionString) ->
        ###
        Get an object instance from its Forsyth-Edwards representation
        ###
        elements = positionString.split(' ')
        [boardString, turnChar, allowedCastlingString, enPassantString] = elements

        halfMoveClock = 0
        moveNumber = 1
        switch elements.length
            when 5
                halfMoveClock = parseInt(elements[4])
            when 6
                halfMoveClock = parseInt(elements[4])
                moveNumber = parseInt(elements[5])

        # Process each element one by one
        pieces            = CMGPosition._boardStringToPieces(boardString)
        allowedCastling   = CMGPosition._allowedCastlingStringToValue(allowedCastlingString)
        enPassantSquare   = CMGPosition._enPassantStringToSquare(enPassantString)
        turn              = CMGPosition._turnCharToValue(turnChar)

        # Return the position
        new CMGPosition(pieces, turn, allowedCastling, enPassantSquare, halfMoveClock, moveNumber)

    # -------------------------------------------------------------------------
    # Private functions of class (comparable to static methods)

    @_boardStringToPieces: (boardString) ->
        # Reverse, so that the table SquareTabId is immediately ordered by square ID
        rowStrings = boardString.split('/').reverse()
        CMGPosition._rowStringsToPieces(rowStrings)

    @_rowStringsToPieces: (rowStrings, pieces = [], rowId = 0) ->
        if rowStrings.length isnt 8
            throw "Incorrect number of rows in #{rowStrings}"

        pieces = {}

        for rowString, rowId in rowStrings
            pieces = CMGPosition._squareCharsToPieces(rowString.split(''), pieces, rowId * CMGPosition.ROW_SPAN, rowId * CMGPosition.ROW_SPAN + 7)

        return pieces

    @_squareCharsToPieces: (rowChars, pieces, currentSquareId, lastSquareIdOfRow) ->
        for rowChar in rowChars
            switch rowChar
                when '1' then currentSquareId += 1 # when character is '1'
                when '2' then currentSquareId += 2
                when '3' then currentSquareId += 3
                when '4' then currentSquareId += 4
                when '5' then currentSquareId += 5
                when '6' then currentSquareId += 6
                when '7' then currentSquareId += 7
                when '8' then currentSquareId += 8 # when character is '8'
                else
                    pieces[currentSquareId] = CMGPiece.fromChar( rowChar )
                    currentSquareId += 1

        return pieces

    @_allowedCastlingStringToValue: (allowedCastlingString) ->
        func = (acc, pce) ->
            switch pce
                when 'K' then return acc + CMGPosition.CASTLING_WHITE_KING
                when 'Q' then return acc + CMGPosition.CASTLING_WHITE_QUEEN
                when 'k' then return acc + CMGPosition.CASTLING_BLACK_KING
                when 'q' then return acc + CMGPosition.CASTLING_BLACK_QUEEN
            acc

        allowedCastlingString.split('').reduce(func, 0)

    @_allowedCastlingValueToString: (allowedCastling) ->
        wqChar = wkChar = bqChar = bkChar = ''
        wqChar = 'Q' if allowedCastling & CMGPosition.CASTLING_WHITE_QUEEN
        wkChar = 'K' if allowedCastling & CMGPosition.CASTLING_WHITE_KING
        bqChar = 'q' if allowedCastling & CMGPosition.CASTLING_BLACK_QUEEN
        bkChar = 'k' if allowedCastling & CMGPosition.CASTLING_BLACK_KING

        allowedCastlingString = [wkChar, wqChar, bkChar, bqChar].join('')
        if allowedCastlingString is ''
            return '-'

        return allowedCastlingString

    @_enPassantStringToSquare: (enPassantString) ->
        if enPassantString is '-'
            return false

        if enPassantString.length isnt 2
            throw "Invalid en-passant string: #{enPassantString}"
        colValue = enPassantString.charCodeAt(0) - 97 # 'a' in ascii
        rowValue = enPassantString.charCodeAt(1) - 49 # '1' in ascii
        CMGPosition._squareReference(rowValue, colValue)

    @_turnCharToValue: (turnChar) ->
        if turnChar isnt 'b' and turnChar isnt 'w'
            throw "Invalid turn character: #{turnChar}"

        return turnChar

    @_squareReference: (rowId, colId) ->
        CMGPosition.ROW_SPAN * rowId + colId

    @_getPieceOnSquare: (item, squareKey) ->
        pieces = null
        if item instanceof CMGPosition
            pieces = item.pieces
        else
            pieces = item

        if not pieces.hasOwnProperty(squareKey)
            return false

        return pieces[squareKey]

    # -------------------------------------------------------------------------
    # Constructor

    constructor: (@pieces, @turn, @allowedCastling = 0, @enPassantSquare = false, @halfMoveClock = 0, @moveNumber = 0) ->
        ###
        Constructor
        @param pieces ([CMGPiece])
        @param turn (false|"b"|"w")
        @param allowedCastling (integer)
        @param enPassantSquare (false|integer where integer is between 0 (bottom right corner) an 119 (top right corner in 0x88 representation)
        @param halfMoveClock (integer)
        @param moveNumber (integer)
        ###

        @bitBoards = {}
        @_generateBitBoards()

    # -------------------------------------------------------------------------
    # Public functions of object (comparable to non static methods)

    playerColorCode: () ->
        @turn

    opponentColorCode: () ->
        switch @turn
            when "b" then return "w"
            when "w" then return "b"
        false

    toString: () ->
        ###
        Get the Forsyth-Edwards representation of the object
        ###
        [@toStringWithoutCounters(), @halfMoveClock, @moveNumber].join(' ')

    toStringWithoutCounters: () ->
        boardString = @_piecesToBoardString(@pieces)
        turnChar = @turn # neither filtering nor transformation necessary in this direction
        allowedCastlingString = CMGPosition._allowedCastlingValueToString(@allowedCastling)
        enPassantString = @_enPassantSquareToString(@enPassantSquare)

        [boardString, turnChar, allowedCastlingString, enPassantString].join(' ')

    isValidMove: (fromSquare, toSquare, promotion = false) ->
        'todo implement'

    allPossibleMovesFromSquare: (_) ->
        [] # todo implement

    allPossibleMoves: () ->
        result = []

        for square, piece of @pieces
            if piece.color isnt @turn
                continue
            moves = @allPossibleMovesFromSquare(square)
            if moves.length > 0
                result = result.concat(moves)

        return result

    isDraw: () ->
        ###
        Is the position a draw
        @return boolean
        ###
        return 'todo'

    getWinnerColorCode: () ->
        ###
        Get the winner color code
        @return (false|'b'|'w')
        ###
        return 'todo'

    # -------------------------------------------------------------------------
    # Private functions of object (comparable to non static methods)

    _piecesToBoardString: () ->
        ( @_piecesToRowStrings() ).join('/')

    _piecesToRowStrings: () ->
        rowId = 8
        rowStrings = []

        while rowId > 0
            rowId--
            rowStrings.push( @_piecesOnRowToRowString(rowId) )

        return rowStrings

    _piecesOnRowToRowString: (rowId) ->
        colId = 0
        rowChars = []
        emptySquareCounter = 0

        while colId < 8

            squareKey = CMGPosition._squareReference(rowId, colId)
            pieceFound = @_getPieceOnSquare(squareKey)

            if pieceFound is false
                emptySquareCounter++
            else
                pieceChar = pieceFound.toChar()
                if emptySquareCounter > 0
                    rowChars.push(emptySquareCounter)
                rowChars.push(pieceChar)
                emptySquareCounter = 0

            colId++

        if emptySquareCounter isnt 0
            rowChars.push(emptySquareCounter)

        rowChars.join('')

    _enPassantSquareToString: (squareNumber) ->
        if squareNumber is false
            return '-'

        return @_squareToString(squareNumber)

    _squareToString: (squareNumber) ->
        rowValue = Math.floor(squareNumber / CMGPosition.ROW_SPAN) # 0x88 representation
        colValue = squareNumber % CMGPosition.ROW_SPAN # 0x88 representation

        String.fromCharCode(colValue + 97) + String.fromCharCode(rowValue + 49) # 97 is 'a', 49 is '1'

    _getPieceOnSquare: (squareKey) ->
        CMGPosition._getPieceOnSquare(@pieces, squareKey)

    _generateBitBoards: () ->
        @bitBoards.allPieces = 0x0
        @bitBoards.allPiecesOfColorAndType =
            'b':
                'r': 0x0
                'n': 0x0
                'b': 0x0
                'k': 0x0
                'q': 0x0
                'p': 0x0
            'w':
                'r': 0x0
                'n': 0x0
                'b': 0x0
                'k': 0x0
                'q': 0x0
                'p': 0x0

        for square, {color: color, type: type} of @pieces
            bvs = @_bitValueOfSquare(square)
            @bitBoards.allPieces |= bvs
            @bitBoards.allPiecesOfColorAndType[color][type] |= bvs

    _bitValueOfSquare: (square) ->
        # All these tests are necessary because of the 0x88 representation
        if square < 0x20
            return Math.pow(2, square)
        else if square < 0x40
            return Math.pow(2, square - 0x10)
        else if square < 0x60
            return Math.pow(2, square - 0x20)
        else if square < 0x100
            return Math.pow(2, square - 0x30)
        else if square < 0x120
            return Math.pow(2, square - 0x40)
        else if square < 0x140
            return Math.pow(2, square - 0x50)
        else if square < 0x160
            return Math.pow(2, square - 0x60)
        else
            return Math.pow(2, square - 0x70)

# =============================================================================

class CMGMove
    constructor: (@fromSquare, @fromPiece, @toSquare, @toPiece, @newPosition, @castling = false, @takenPiece = false, @takenOnSquare = false) ->
        ###
        Constructor
        @param fromSquare (integer)
        @param fromPiece (CMGPiece)
        @param toSquare (integer)
        @param toPiece (CMGPiece)
        @param newPosition (CMGPosition)
        @param castling (false|"q"|"k")
        @param takenPiece (false|CMGPiece)
        @param takenOnSquare (false|integer)
        ###

    toString:   () -> throw "Todo: implement"

# =============================================================================

class CMGPiece
    constructor: (@color, @type) ->
        ###
        Constructor
        @param color ("b"|"w") black or white
        @param type ("p"|"n"|b"|"r"|"q"|"k") pawn, knight, bishop, rook, queen or king
        ###

    # -------------------------------------------------------------------------
    # Public functions of class (comparable to static methods)

    @fromChar: (pieceChar) ->
        [color, piece] = CMGPiece._charToInternalRepresentation( pieceChar )

        return new CMGPiece( color, piece )

    # -------------------------------------------------------------------------
    # Protected functions of class (comparable to static methods)

    @_charToInternalRepresentation: (pieceChar) ->
        charCode = pieceChar.charCodeAt(0)
        color = 'b'
        piece = null
        if charCode < 97
            # Uppercase => transform and mark as white
            color = 'w'
            charCode += 32 # 97 - 65, i.e. code('a') - code('A')

        if charCode isnt 114 and charCode isnt 110 and charCode isnt 98 and charCode isnt 113 and charCode isnt 107 and charCode isnt 112
            # Not in r, n, b, q, k, p
            throw "Invalid character code to represent a chess piece: #{charCode}"

        return [color, String.fromCharCode(charCode)]

    # -------------------------------------------------------------------------
    # Public functions of object (comparable to non-static methods)

    toChar: () ->
        out = @type

        if @color is 'w'
            out = String.fromCharCode( @type.charCodeAt(0) - 32 ) # 97 - 65, i.e. code('a') - code('A')

        return out


# =============================================================================

module.exports =
    position: CMGPosition
    move: CMGMove
