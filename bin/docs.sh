#!/bin/bash

set -eu

yarn run dist

node ./config/build-app.js
