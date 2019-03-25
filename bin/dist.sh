#!/bin/bash

set -eu

# first clean up old files
rm -rf dist morfi-test-utils/npm/dist morfi-test-utils/npm/src

# run rollup
rollup -c

# now copy some files for distribution of morfi-test-utils
cp -r morfi-test-utils/src morfi-test-utils/npm/src
# modify the import to use the external peer dependency morfi
sed -i "s|'\.\.\/\.\.\/src'|'morfi'|" morfi-test-utils/npm/src/index.js
