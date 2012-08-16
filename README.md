# Chess Move Generator
## Readme File
Author: François Cardinaux

Copyright: François Cardinaux, Genève, 2012

Licences: to be defined, very probably open source

---

# Description of the Project

A chess move generator.

# Folder structure

    coffee/
    javascript/
    node_modules/

# Credits

For the algorithm:

* http://stackoverflow.com/questions/494721/what-are-some-good-resources-for-writing-a-chess-engine
* Jonatan Pettersson's blog:
* http://mediocrechess.blogspot.com/
* [Move generation](http://mediocrechess.blogspot.com/2006/12/guide-move-generation.html)
* [The 0x88 representation](http://mediocrechess.blogspot.com/2006/12/0x88-representation.html)
* [Attacked squares](http://mediocrechess.blogspot.com/2006/12/guide-attacked-squares.html)

Bitboard algorithm:

* [Bitboard on Wikipedia](http://en.wikipedia.org/wiki/Bitboard)
* [Working with large integers in JavaScript](http://www.2ality.com/2012/07/large-integers.html)

For debugging and tests:

* Roce: http://www.rocechess.ch/rocee.html
* Perft suite: http://hem.passagen.se/maragor/perftsuite.epd, which can be found inside Roce
* http://mediocrechess.blogspot.com/2007/01/guide-perft-scores.html
* http://www.albert.nu/programs/sharper/perft.asp
* https://chessprogramming.wikispaces.com/Perft+Results

# Conventions

Forsyth–Edwards Notation (FEN) is used to describe a particular board position:
* http://en.wikipedia.org/wiki/Forsyth%E2%80%93Edwards_Notation
