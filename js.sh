# Compile coffeescript to get javascript
# Author François Cardinaux
# Copyright: François Cardinaux, Genève, 2012

echo ""
echo -e "\033[44mJavascript files\033[0m"
echo -e "\033[44m================\033[0m"
echo ""

yui_compressor=external/yuicompressor-2.4.6.jar

# =============================================================================

rm javascript/*.*
rm test/*.js

# =============================================================================

echo "Compiling the coffeescript files..."
cd coffee/
coffee -b -o ../javascript/ -c .

# =============================================================================

echo "Generating the bitboards..."
cd ../js-generator/
mv ../javascript/bitboard-generator.js .
node js-generator.js

# =============================================================================

echo "Merging the bitboards at the end of the chess move generator..."
cd ../javascript/
awk 'FNR==1{print "/* "FILENAME" */"}1' bitboards.js >> chess-move-generator.js
rm bitboards.js
mv chess-move-generator.test.js ../test/

# =============================================================================

case $# in
    0)
        echo "Compressing..."
        java -jar ../$yui_compressor -o chess-move-generator.js chess-move-generator.js
        echo '// Chess Move Generator - Copyright 2012 François Cardinaux, CH 1207 Genève - License: todo' | cat - chess-move-generator.js > temp && mv temp chess-move-generator.js
        ;;
    1)
        case $1 in
            "u")
                echo "Leaving the file uncompressed..."
                ;;
            *)
                echo -e "\033[31mUnknown parameter $1\033[0m"
                exit
                ;;
        esac
        ;;
    *)
        echo -e "\033[31mToo many parameters\033[0m"
        exit
        ;;
esac

# =============================================================================

echo "Running unit tests..."

cd ..
T="$(date +%s)"
node_modules/expresso/bin/expresso test/chess-move-generator.test.js
# http://stackoverflow.com/a/3684051
T="$(($(date +%s)-T))"
printf "Elapsed time: %02d:%02d:%02d:%02d\n" "$((T/86400))" "$((T/3600%24))" "$((T/60%60))" "$((T%60))"