#!/bin/bash

set -eu

# first clean up old files
rm -rf dist morfi-test-utils/npm/dist morfi-test-utils/npm/src

# run rollup
yarn run rollup -c

# now copy some files for distribution of morfi-test-utils
cp -r morfi-test-utils/src morfi-test-utils/npm/src

if [[ "$OSTYPE" == "darwin"* ]]; then
    # modify the import to use the external peer dependency morfi
    sed -i '' "s|'\.\.\/\.\.\/src'|'morfi'|" morfi-test-utils/npm/src/index.js
    # fix incorrect flow paths
    sed -i '' "s|\.\.\/src|src|" morfi-test-utils/npm/dist/cjs/index.js.flow
    sed -i '' "s|\.\.\/src|src|" morfi-test-utils/npm/dist/esm/index.js.flow
else
    # modify the import to use the external peer dependency morfi
    sed -i "s|'\.\.\/\.\.\/src'|'morfi'|" morfi-test-utils/npm/src/index.js
    # fix incorrect flow paths
    sed -i "s|\.\.\/src|src|" morfi-test-utils/npm/dist/cjs/index.js.flow
    sed -i "s|\.\.\/src|src|" morfi-test-utils/npm/dist/esm/index.js.flow
fi


