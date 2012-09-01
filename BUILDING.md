# Chess Move Generator
## Building File
Author: François Cardinaux

Copyright: François Cardinaux, Genève, 2012

Licences: see README.md

---

Installation of the necessary software
======================================

Expresso for unit tests:

    cd ~/DevNodeJs/chess-move-generator.js/
    sudo npm install expresso

How to build the javascript
===========================

Use the following command:

    ./js.sh

Three parameters are possible:

* j: use the clujure compiler
* y: use the yui compressor
* t: run unit tests

Examples:

* For production:

      ./js.sh j y

* For performance tests:

      ./js.sh j y t

* For tests with debugging:

      ./js.sh t
