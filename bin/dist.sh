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

# deploy utility
rm -rf morfi-test-utils/dist
mkdir -p morfi-test-utils/dist
NODE_ENV=production babel src/test/form-test-util.js --out-file morfi-test-utils/dist/index.js
cp src/test/form-test-util.js morfi-test-utils/dist/index.js.flow

sed -i "s|'\.\.\/js\/form'|'morfi'|" morfi-test-utils/dist/index.js
sed -i "s|'\.\.\/js\/form'|'morfi'|" morfi-test-utils/dist/index.js.flow
