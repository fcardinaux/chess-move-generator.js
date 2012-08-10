# Compile coffeescript to get javascript
# Author François Cardinaux
# Copyright: François Cardinaux, Genève, 2012

echo ""
echo -e "\033[44mJavascript files\033[0m"
echo -e "\033[44m================\033[0m"
echo ""

echo "Compiling the coffeescript files..."
cd coffee/
coffee -b -o ../javascript/ -c .

echo "Running unit tests..."

cd ..
node_modules/expresso/bin/expresso javascript/chess-move-generator.test.js
