# Chess Move Generator
## Building File
Author: François Cardinaux

Copyright: François Cardinaux, Genève, 2012

Licences: see README.md

---

## Installation of the necessary software

Node.js for compilation and unit tests: follow the instructions on [the official Node.js website](http://nodejs.org/).

Expresso for unit tests:

    cd ~/DevNodeJs/chess-move-generator.js/
    sudo npm install expresso

## How to build the javascript

Use the following command:

    ./js.sh

Three parameters are possible:

* j: use the clojure compiler
* y: use the yui compressor
* t: run unit tests

Examples:

* For production:

      ./js.sh j y

* For performance tests:

      ./js.sh j y t

* For tests with debugging:

      ./js.sh t

## How to run unit tests

As explained above:

* If you just want to test the functions, not the performances, run:

      ./js.sh t

* For performance tests:

      ./js.sh j y t

Note that a few of the global values that are defined in chess-move-generator.test.coffee can be modified to switch some tests on and off:

* `DO_ELEMENTARY_TESTS`: perform elementary tests
* `DO_POSSIBLE_MOVE_TEST`: test all possible moves from given positions
* `DO_DIVISION_TEST`: perform division tests
* `DO_PERFTSUITE` and `DEPTH`: run the perft suite at the specified maximal depth

