import fs from 'fs';

// FIXME: See if this is necessary

const CJS_FILE = 'dist/test-utils/index.cjs.js';
const ES_FILE = 'dist/test-utils/index.es.js';

// read
const testUtilCJS = fs.readFileSync(CJS_FILE, 'utf-8');
const testUtilES = fs.readFileSync(ES_FILE, 'utf-8');

// update
fs.writeFileSync(CJS_FILE, testUtilCJS.replace("require('..')", "require('../index.')"))
