###
Chess Move Generator - Complements for Tests
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md
###

class clg
    @opened: false

    @open: (val = true) ->
        prev = @opened
        @opened = val
        return prev

    @close: () ->
        @opened = false

    @log: (x, isBitBoard = false) ->
        if not @opened
            return
        if isBitBoard
            @_logBitBoard(x)
        else
            console.log(x)

    @_logBitBoard: (bb) ->
        ###
        For debugging
        ###
        console.log(JSON.stringify(bb) + ':')
        console.log('+--------+')
        val = ['.', 'x']
        for quadrantKey in [3..0]
            quadrant = bb[quadrantKey]
            lines = []
            lines[0] = Math.floor(quadrant / 256)
            lines[1] = quadrant % 256
            for line in lines
                text = ''
                for bit in [0..7]
                    text += val[line % 2]
                    line = Math.floor( line / 2 )
                console.log('|' + text + '|')
        console.log('+--------+')

# =============================================================================

NoCompile.position['_allowedCastlingStringToValue'] = CMGPosition._allowedCastlingStringToValue
NoCompile.position['_allowedCastlingValueToString'] = CMGPosition._allowedCastlingValueToString

NoCompile.bitBoard = CMGBitBoard
NoCompile.bitBoard['valueOfSquare'] = CMGBitBoard.valueOfSquare

if typeof module isnt 'undefined'
    module['exports']['bitBoard'] = NoCompile.bitBoard

