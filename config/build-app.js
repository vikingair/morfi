#!/bin/env node
'use strict';

process.env.NODE_ENV = 'production';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
    throw err;
});

const chalk = require('chalk');
const fs = require('fs-extra');
const webpack = require('webpack');
const paths = require('./paths');
const utils = require('./utils');

// Warn and crash if required files are missing
if (!utils.checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
    process.exit(1);
}

function copyPublicFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml,
    });
}

// Remove all content but keep the directory so that
// if you're in it, you don't end up in Trash
fs.emptyDirSync(paths.appBuild);
// Merge with the public folder
copyPublicFolder();
// Start the webpack build
console.log('Creating an optimized production build...');

const handleWebpackProcess = config =>
    new Promise(resolve => {
        webpack(require(config)).run((err, stats) => {
            if (err) {
                console.log(chalk.red('Failed to compile.\n'));
                console.log(chalk.red(err));
                process.exit(1);
            }
            const statsJson = stats.toJson({}, true);
            if (statsJson.errors.length || statsJson.warnings.length) {
                console.log(chalk.red('Failed to compile.\n'));
                console.log(chalk.red(stats));
                process.exit(1);
            }
            statsJson.assets.forEach(asset => {
                const printedSize = asset.size > 1000 ? asset.size / 1000 + ' kB' : asset.size + ' Bytes';
                console.log(chalk.white.bold(' - ' + asset.name + ': ') + chalk.green(printedSize));
            });
            resolve();
        });
    });

handleWebpackProcess('./webpack.config.app.prod');
