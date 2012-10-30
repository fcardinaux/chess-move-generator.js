# Chess Move Generator - Readme File

* Author: François Cardinaux
* Copyright: François Cardinaux, Genève, 2012
* Licences: GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html)

## Description of the Project

A chess move generator.

## Folder structure

    (project root)
     |
     +-- coffee/                    All coffeescript source files
     |
     +-- for-pandoc/                Stylesheets and templates to generate beautiful HTML documents
     |
     +-- javascript/                Contains the resulting javascript file
     |
     +-- js-generator/              Contains javascript files for bitboard script generation (see js.sh in project root for more information)
     |
     +-- node_modules/              The only necessary node.js module is "expresso" for unit tests
     |
     +-- test/                      Contains the javascript for unit tests
     |
     +-- test-data/                 Contains all test vectors for unit tests

## Credits

For the algorithm:

* StackOverflow question: [What are some good resources-for-writing-a-chess-engine](http://stackoverflow.com/questions/494721/what-are-some-good-resources-for-writing-a-chess-engine)
* [Jonatan Pettersson's blog](http://mediocrechess.blogspot.com/):
     * [Move generation](http://mediocrechess.blogspot.com/2006/12/guide-move-generation.html)
     * [The 0x88 representation](http://mediocrechess.blogspot.com/2006/12/0x88-representation.html)
     * [Attacked squares](http://mediocrechess.blogspot.com/2006/12/guide-attacked-squares.html)

Bitboard algorithm:

* [Bitboard on Wikipedia](http://en.wikipedia.org/wiki/Bitboard)
* [Working with large integers in JavaScript](http://www.2ality.com/2012/07/large-integers.html)

For debugging and tests:

* [Roce](http://www.rocechess.ch/rocee.html)
* [Perft suite](http://hem.passagen.se/maragor/perftsuite.epd), which can be also found inside Roce
* [Perft scores - validating the move generation](http://mediocrechess.blogspot.com/2007/01/guide-perft-scores.html)
* An article on [Perft calculation](http://www.albert.nu/programs/sharper/perft.asp)
* [Perft Results](https://chessprogramming.wikispaces.com/Perft+Results) on the [Chess Programming Wiki](https://chessprogramming.wikispaces.com/)

## Conventions

The [Forsyth–Edwards Notation (FEN)](http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) is used to describe a particular board position.