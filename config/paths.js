'use strict';

const path = require('path');
const fs = require('fs');

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

// config after eject: we're in ./config/
module.exports = {
    appBuild: resolveApp('docs/'),
    appPublic: resolveApp('docs_src/public/'),
    appHtml: resolveApp('docs_src/public/index.html'),
    appIndexJs: resolveApp('docs_src/index.js'),
    appSrc: resolveApp('docs_src/'),
    appAssets: resolveApp('docs_src/assets/'),
};
