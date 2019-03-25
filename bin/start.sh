#!/bin/bash

set -eu

yarn run dist

yarn run webpack-dev-server \
    --color  \
    --open \
    --port 3100 \
    --quiet \
    --contentBase docs_src/public \
    --config config/webpack.config.app.dev.js
