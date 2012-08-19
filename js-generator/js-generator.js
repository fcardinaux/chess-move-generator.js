/**
 * Microgambit application javascript
 * Author: François Cardinaux
 * Copyright: François Cardinaux 2012
 */

// ---------------------------------------------------------------------------------------------------------------------
// Generate the script

var fileSystemAPI = require( 'fs' ),
    bitBoardGenerator = require( './bitboard-generator' ),
    scriptLines = bitBoardGenerator.generateJavascriptLines('CMGBitBoard.', 'CMGPosition.', 'Generated chess bitboards - copyright 2012 François Cardinaux, Genève');

// ---------------------------------------------------------------------------------------------------------------------
// Write the script to a file

var fs = require('fs');
fileSystemAPI.writeFile("../javascript/bitboards.js", scriptLines.join("\n"), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("... the bitboards have been correctly generated.");
    }
});