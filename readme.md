# Chess Move Generator - Readme File

* Author: François Cardinaux
* Copyright: François Cardinaux, Genève, 2012
* Licences: GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html)

## Description of the Project

A chess move generator.

## Quick Starting Guide

### To use the Javascript chess move generator

You do not have to download or clone this entire project to use the Javascript program. You only need to download the <a href="https://github.com/fcardinaux/chess-move-generator.js/blob/master/javascript/chess-move-generator.js"><code>javascript/chess-move-generator.js</code></a> file.

The <a href="https://github.com/fcardinaux/chess-move-generator.js/blob/master/tutorial.md"><code>tutorial.md</code></a> file shows you how to use the chess move generator.

### To get an overview of the folder structure

Read this file further.

### To know which software must or should be installed to build and test the move generator

Read the <a href="https://github.com/fcardinaux/chess-move-generator.js/blob/master/building.md"><code>building.md</code></a> file.

### To know how to build the move generator

Read the <a href="https://github.com/fcardinaux/chess-move-generator.js/blob/master/building.md"><code>building.md</code></a> file, sections “How to build the javascript”.

### To know how to run unit tests

Read the <a href="https://github.com/fcardinaux/chess-move-generator.js/blob/master/building.md"><code>building.md</code></a> file, section “How to run unit tests”.

### To know more about Node.js

Node.js is only used to create a local server for the present application. It is intended to be replaced with files served via _Alfresco_ and _Apache Tomcat_. Node.js is a vast subject, and a good start to learn about it is the [Wikipedia article](http://en.wikipedia.org/wiki/Node.js).

### To know more about any term encountered in the source code or the documentation

A glossary file is still missing in this project.

### To know more about the Markdown syntax

Articles:
* [Wikipedia](http://en.wikipedia.org/wiki/Markdown)
* [Daring Fireball](http://daringfireball.net/): [Jown Gruber's _Markdown Syntax_](http://daringfireball.net/projects/markdown/syntax)

## Folder structure

    (project root)
     |
     +-- coffee/                                       All Coffeescript source files
     |    |
     |    +-- bitboard-generator.coffee                Meta-program to generate the bitboards
     |    |
     |    +-- chess-move-generator.coffee              The chess move generator in Coffeescript
     |    |
     |    +-- chess-move-generator
     |    |       .complements-for-tests.coffee        This file contains code that is appended
     |    |                                            to the chess move generator in case
     |    |                                            you run unit tests
     |    |
     |    +-- chess-move-generator.test.coffee         The unit tests
     |
     +-- for-pandoc/                                   Stylesheets and templates to generate
     |                                                 beautiful HTML documents
     |
     +-- javascript/                                   Contains the resulting javascript file
     |
     +-- js-generator/                                 Contains javascript files for bitboard
     |                                                 script generation (see js.sh in project
     |                                                 root for more information)
     |
     +-- node_modules/                                 The only necessary node.js module is
     |                                                 "expresso" for unit tests
     |
     +-- test/                                         Contains the javascript for unit tests
     |
     +-- test-data/                                    Contains all test vectors for unit tests

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

### Board representation

The [Forsyth–Edwards Notation (FEN)](http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation) is used to represent a particular board position.

The present generator accepts two versions of this notation:

* the standard FEN notation, which includes the halfmove clock and the fullmove number
* a version without these two counters. This version can be used to represent a chess problem.

### Move representation

Each move is represented by a four- or five-character string which is similar to the [coordinate notation](http://en.wikipedia.org/wiki/Chess_notation#Move_notations_for_humans), except that we omit the dash between the start and end squares. More specifically:

* the first two characters represent the start square, and the next two characters represent the end square of the move.
* the fifth character is normally absent, except for promotion moves ('q', 'r', 'n', 'b' for promotion to queen, rook, knight and bishop)
* No abbreviation is used to show which piece is moving or which piece is taken
* No [annotation symbol](http://en.wikipedia.org/wiki/Punctuation_(chess)) is used either

Here are some examples:

* "e2e4" (e.g. first pawn move)
* "b8c6" (knight move)
* "c3h3" (could be a rook or a queen move)
* "e1g1" (could be white's king-side castling)
* "h7h8q" (white pawn promoted to queen)

### Square representation

In the current version of the move generator, the individual squares are represented by an integer number from 0 to 63:

* 0 = a1
* 1 = b1
* ...
* 7 = h1
* 8 = a2
* ...
* 63 = h8

## Restriction

The [threefold repetition rule](http://en.wikipedia.org/wiki/Threefold_repetition) is __not__ implemented in the present program. Indeed, it requires the knowledge of the entire position sequence of a game, and is therefore beyond the scope of this move generator.
