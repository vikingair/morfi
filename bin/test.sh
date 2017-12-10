#!/bin/bash

set -eu

PROJECT_ROOT=`dirname ${0}`/..
pushd ${PROJECT_ROOT} &>/dev/null

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo ""
echo -e "Running ${CYAN}flow${NC}:"
echo -e "${GREEN}"
npm --silent --dry-run=true run flow

echo ""
echo -e "${NC}"
echo -e "Running ${CYAN}eslint${NC}:"
npm --silent run eslint
echo ""
echo -e "${GREEN}No errors!${NC}"

echo ""
echo ""
echo -e "Running ${CYAN}tests${NC}:"
echo ""
CI=true npm --silent run test -- --coverage

popd &>/dev/null
