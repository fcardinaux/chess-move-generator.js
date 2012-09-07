###
Chess Move Generator - Complements for Tests
@author François Cardinaux, CH 1207 Genève
@copyright 2012 François Cardinaux

Licence: see README.md
###

# =============================================================================
# http://helephant.com/2007/05/12/diy-javascript-stack-trace/

Function::trace = () ->
    trace = []
    current = this
    while current
        trace.push(current.signature())
        current = current.caller
    return trace

Function::signature = () ->
    ftostring = () ->
        params = ""
        if @params.length > 0
            params = "'" + @params.join("', '") + "'"
        return @name + "(" + params + ")"

    signature =
        name: @getName(),
        params: [],
        toString: ftostring
    if @arguments
        for x in [0..(arguments.length - 1)]
            signature.params.push(@arguments[x])

    return signature

Function::getName = () ->
    if @name
        return @name
    definition = @toString().split("\n")[0]
    exp = /^function ([^\s(]+).+/
    if(exp.test(definition))
        return definition.split("\n")[0].replace(exp, "$1") || "anonymous"
    return "anonymous"

# =============================================================================

class profiler
    @threshhold: 100000
    @pile: []
    @open: (name) ->
        description =
            start: new Date().getTime(),
            name: name
        @pile.push(description)

    @close: () ->
        description = @pile.pop()
        duration = new Date().getTime() - description.start
        if duration < @threshhold
            return false

        indent = ""
        for i in [1..@pile.length]
            indent = indent + "    "
        console.log(indent + description.name + ': ' + duration)

# =============================================================================

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

NoCompile.utility = CMGUtil
NoCompile.utility['to0x88representation']   = CMGUtil.to0x88representation
NoCompile.utility['from0x88representation'] = CMGUtil.from0x88representation

if typeof module isnt 'undefined'
    module['exports']['bitBoard'] = NoCompile.bitBoard
    module['exports']['utility']  = NoCompile.utility

