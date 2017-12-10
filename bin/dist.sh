#!/bin/bash

set -eu

# first clean up old files
rm -rf dist

# use the same babel configurations as create-react-app
NODE_ENV=production babel src/js/form --out-dir dist

# generate flow source maps
for i in `ls src/js/form/`; do cp src/js/form/$i dist/$i.flow; done

# remove redundant test files
rm `ls dist/*.test.js*`
