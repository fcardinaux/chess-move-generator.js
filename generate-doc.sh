# Documentation generation script
# Author: François Cardinaux
# Copyright: François Cardinaux 2012

home_folder=$PWD
target_folder=_html
index=$home_folder/$target_folder/index.html

# For the iframe: http://stackoverflow.com/questions/1303729/iframe-100-height-inside-body-with-padding
# For the navigation buttons: http://css.maxdesign.com.au/listamatic/vertical13.htm
echo "<!doctype html>
<html>
  <title>Documentation index</title>
  <style>
  html, body { margin: 0; padding: 0; height: 100%; }
  div {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      padding: 5px;
      margin: 0;
  }
  div#content {}
  div#anchors {
      width: 15%;
      background-color: #f0e7d7;
  }
  div#anchors h1 {
      padding-left: 5px;
  }
  div#pages {
      width: 80%;
      left: 17%;
  }
  #bar { height: 32px; background: red; }
  iframe {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      border: none; padding-top: 32px;
      box-sizing: border-box; -moz-box-sizing: border-box; -webkit-box-sizing: border-box;
  }
  #navcontainer
  {
    top: 100px;
    background: #f0e7d7;
    width: 100%;
    margin: 0 auto;
    padding: 1em 0;
    font-family: georgia, serif;
    font-size: 13px;
    text-align: center;
    text-transform: lowercase;
  }
  ul#navlist
  {
    text-align: left;
    list-style: none;
    padding: 0;
    margin: 0 auto;
    width: 70%;
  }
  ul#navlist li
  {
    display: block;
    margin: 0;
    padding: 0;
  }
  ul#navlist li a
  {
    display: block;
    width: 100%;
    padding: 0.5em 0 0.5em 2em;
    border-width: 1px;
    border-color: #ffe #aaab9c #ccc #fff;
    border-style: solid;
    color: #777;
    text-decoration: none;
    background: #f7f2ea;
  }
  #navcontainer>ul#navlist li a { width: auto; }
  ul#navlist li#active a
  {
    background: #f0e7d7;
    color: #800000;
  }
  ul#navlist li a:hover, ul#navlist li#active a:hover
  {
    color: #800000;
    background: transparent;
    border-color: #aaab9c #fff #fff #ccc;
  }
  </style>
<head>
</head>" > $index
echo "  <body>" >> $index
echo '    <div id="content">' >> $index
echo '    <div id="anchors"><h1>Chess Move Generator</h1>' >> $index
echo '    <div id="navcontainer">' >> $index
echo '    <ul id="navlist">' >> $index

echo "Converting top-level documents:"

files=($home_folder/*.md)
for path_to_file in "${files[@]}"
do
    # $path_to_file store current file name with path
    # $md_file_name is the file name without path
    md_file_name=`basename $path_to_file`
    # remove the last 3 characters (.md)
    label=`echo $md_file_name | sed 's/\(.*\).../\1/'`
    # replace "-" with " ". The last g means "all occurrences"
    label=`echo $label | sed 's/-/ /g'`
    html_file_name=$md_file_name.html
    echo " -> Processing $md_file_name ..."
    pandoc --css=$home_folder/for-pandoc/buttondown.css --css=$home_folder/for-pandoc/pandoc-templates/documentation.css --self-contained --template=$home_folder/for-pandoc/pandoc-templates/default.html --table-of-contents -V toctitle:'Table of contents' -f markdown -t html5 -o $target_folder/$html_file_name $path_to_file
    echo '<li><a href="file://'$home_folder/$target_folder/$html_file_name'" target="for-pages">'$label'</a></li>' >> $index
done

if [ -d "doc" ]; then
    echo "Converting documentation:"
    # Source: http://www.techiecorner.com/1522/how-to-loop-thru-directory-files-in-bash-shell/
    for doc_folder in doc # business doc-phase-1
    do
        files=($home_folder/$doc_folder/*.md)
        for path_to_file in "${files[@]}"
        do
            # $path_to_file store current file name with path
            # $md_file_name is the file name without path
            md_file_name=`basename $path_to_file`
            # remove the last 3 characters (.md)
            label=`echo $md_file_name | sed 's/\(.*\).../\1/'`
            # replace "-" with " ". The last g means "all occurrences"
            label=`echo $label | sed 's/-/ /g'`
            html_file_name=$md_file_name.html
            echo " -> Processing $md_file_name ..."
            pandoc --css=$home_folder/for-pandoc/buttondown.css --css=$home_folder/for-pandoc/pandoc-templates/documentation.css --self-contained --template=$home_folder/for-pandoc/pandoc-templates/default.html --table-of-contents -V toctitle:'Table of contents' -f markdown -t html5 -o $target_folder/$html_file_name $path_to_file
            echo '<li><a href="file://'$home_folder/$target_folder/$html_file_name'" target="for-pages">'$label'</a></li>' >> $index
        done
    done
fi

echo "    </ul>" >> $index
echo "    </div>" >> $index
echo "    </div>" >> $index
echo '    <div id="pages"><iframe name="for-pages" id="for-pages" scrolling="no"></iframe>' >> $index
echo "    </div>" >> $index
echo "    </div>" >> $index
echo "  </body>" >> $index
echo "</html>" >> $index

echo "Done. The html files can be found in the $target_folder folder, and index is file://localhost$index"