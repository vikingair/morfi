'use strict';

const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');

const checkRequiredFiles = files => {
    let currentFilePath = '';
    try {
        files.forEach(filePath => {
            currentFilePath = filePath;
            fs.accessSync(filePath, fs.F_OK);
        });
        return true;
    } catch (err) {
        const dirName = path.dirname(currentFilePath);
        const fileName = path.basename(currentFilePath);
        console.log(chalk.red('Could not find a required file.'));
        console.log(chalk.red('  Name: ') + chalk.cyan(fileName));
        console.log(chalk.red('  Searched in: ') + chalk.cyan(dirName));
        return false;
    }
};

const readFilesRecursive = (root, files = [], prefix = '') => {
    const dir = path.join(root, prefix);
    if (!fs.existsSync(dir)) return files;
    if (fs.statSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(name => {
            readFilesRecursive(root, files, path.join(prefix, name));
        });
    } else {
        files.push(prefix);
    }
    return files;
};

const uuid = a =>
    a
        ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16)
        : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid);

module.exports = {
    checkRequiredFiles,
    readFilesRecursive,
    uuid,
};
