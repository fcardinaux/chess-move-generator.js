# Compile coffeescript to get javascript
# Author François Cardinaux
# Copyright: François Cardinaux, Genève, 2012

echo ""
echo -e "\033[44mJavascript files\033[0m"
echo -e "\033[44m================\033[0m"
echo ""

clojure_compiler=../external-tools/clojure-compiler/compiler.jar
yui_compressor=../external-tools/yuicompressor-2.4.6.jar

# =============================================================================

rm javascript/*.*
rm test/*.js

# =============================================================================

js_compiler=none
compressor=none
unit_test=no
prepend_header=no
case $# in
    0)
        ;;
    1|2|3)
        for arg in `seq 1 $#`
        do
            case ${!arg} in
                "j")
                    js_compiler=clojure
                    prepend_header=yes
                    ;;
                "t")
                    unit_test=yes
                    ;;
                "y")
                    compressor=yui
                    prepend_header=yes
                    ;;
                *)
                    echo -e "\033[31mUnknown parameter ${!arg}\033[0m"
                    exit
                    ;;
            esac
        done
        ;;
    *)
        echo -e "\033[31mToo many parameters\033[0m"
        exit
        ;;
esac

# =============================================================================

echo "Compiling the coffeescript files..."
cd coffee/
coffee -b -o ../javascript/ -c .
cd ..

# =============================================================================

case $unit_test in
    "no")
        ;;
    "yes")
        echo "Merging additional code for tests at the end of the chess move generator..."
        cd javascript/
        awk 'FNR==1{print "/* "FILENAME" */"}1' chess-move-generator.complements-for-tests.js >> chess-move-generator.js
        cd ..
        ;;
esac
rm javascript/chess-move-generator.complements-for-tests.js

# =============================================================================

echo "Generating the bitboards..."
cd js-generator/
mv ../javascript/bitboard-generator.js .
node js-generator.js
cd ..

# =============================================================================

echo "Merging the bitboards at the end of the chess move generator..."
cd javascript/
awk 'FNR==1{print "/* "FILENAME" */"}1' bitboards.js >> chess-move-generator.js
rm bitboards.js
mv chess-move-generator.test.js ../test/
cd ..

# =============================================================================

case $js_compiler in
    "none")
        echo "Skipping compilation."
        ;;
    "clojure")
        echo "Compiling with clojure compiler..."
        cd javascript/
        # java -jar ../$clojure_compiler --compilation_level=SIMPLE_OPTIMIZATIONS --js=chess-move-generator.js --js_output_file=cmg.js
        java -jar ../$clojure_compiler --compilation_level=ADVANCED_OPTIMIZATIONS --js=chess-move-generator.js --js_output_file=temp
        mv temp chess-move-generator.js
        cd ..
        ;;
esac

# =============================================================================

case $compressor in
    "none")
        echo "Leaving the file uncompressed."
        ;;
    "yui")
        echo "Compressing with yuiCompressor..."
        cd javascript/
        java -jar ../$yui_compressor -o chess-move-generator.js chess-move-generator.js
        cd ..
        ;;
esac

# =============================================================================

case $unit_test in
    "no")
        cd javascript/
        # Strict mode (https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Functions_and_function_scope/Strict_mode)
        echo '"use strict"' | cat - chess-move-generator.js > temp && mv temp chess-move-generator.js
        cd ..
        ;;
    "yes")
        # No strict mode because we use arguments.callee (http://stackoverflow.com/a/7497112)
        ;;
esac

# =============================================================================

case $prepend_header in
    "no")
        ;;
    "yes")
        cd javascript/
        echo '// Chess Move Generator - Copyright 2012 François Cardinaux, CH 1207 Genève (https://github.com/fcardinaux) - License: GPLv3 (http://www.gnu.org/licenses/gpl-3.0.html)' | cat - chess-move-generator.js > temp && mv temp chess-move-generator.js
        cd ..
        ;;
esac

# =============================================================================

case $unit_test in
    "no")
        echo "Skipping unit tests."
        ;;
    "yes")
        echo "Running unit tests..."
        T="$(date +%s)"
        node_modules/expresso/bin/expresso test/chess-move-generator.test.js
        # http://stackoverflow.com/a/3684051
        T="$(($(date +%s)-T))"
        printf "Elapsed time: %02d:%02d:%02d:%02d\n" "$((T/86400))" "$((T/3600%24))" "$((T/60%60))" "$((T%60))"        ;;
    "no")
        ;;
esac
