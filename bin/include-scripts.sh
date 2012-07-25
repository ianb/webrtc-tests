#!/usr/bin/env bash

set -e

base="$(python -c 'import sys, os; print os.path.dirname(os.path.dirname(os.path.abspath(sys.argv[1])))' "$BASH_SOURCE")"

if [ ! -f $base/doctest.js ] ; then
    echo "Could not find $base/doctest.js"
    exit 1
fi

if [ ! -d $base/jshint ] ; then
    echo "Could not find $base/jshint"
    echo "Try:"
    echo "  git clone https://github.com/jshint/jshint.git jshint"
    exit 2
fi

if [ ! -d $base/esprima ] ; then
    echo "Could not find $base/esprima"
    echo "Try:"
    echo "  git clone https://github.com/ariya/esprima.git esprima"
    exit 3
fi

echo "Substituting $base/doctest.js"

uglify_options="--no-copyright --max-line-len 200"

python -c '
import os, sys, re
os.chdir(sys.argv[1])
with open("doctest.js", "rb") as fp:
    content = fp.read()
names = {}
for arg in sys.argv[2:]:
    name, rest = arg.split("=", 1)
    names[name] = rest
regex = re.compile(r"\/\*\s+INSERT\s+(.*?)\s+\*\/\s*\n(.*?)\/*\s+END\s+INSERT\s+\*\/", re.S)
def repl(match):
    print "Replacing %s" % match.group(1)
    return "/* INSERT %s */\n%s\n/* END INSERT */" % (
        match.group(1), names[match.group(1)])
new_content = regex.sub(repl, content)
with open("doctest.js", "wb") as fp:
    fp.write(new_content)
print "wrote doctest.js"
' "$base" esprima.js="$(uglifyjs $uglify_options < esprima/esprima.js)" jshint.js="$(uglifyjs $uglify_options < jshint/jshint.js)"
