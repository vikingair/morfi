import fs from 'fs';
import path from 'path';
import { spawn, spawnSync } from 'child_process';

const exec = async (command, opts) => {
    const cSplit = command.split(' ');
    await new Promise((resolve, reject) => {
        const child = spawn(cSplit[0], cSplit.slice(1), { stdio: 'inherit', ...opts });
        child.on('exit', (exitCode) => {
            if (exitCode) {
                reject(new Error(`exited with ${exitCode}`));
            }
            resolve();
        });
    });
}

const isDirty = (dir) => {
    const result = spawnSync('git', ['diff', '--stat', dir]);
    return result.stdout.toString() !== '';
}

const listFiles = (dir) => {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((fileOrDir) => {
        const p = path.join(dir, fileOrDir.name);
        return fileOrDir.isDirectory() ? listFiles(p) : [p];
    });
};

await exec('pnpm docs:build');

if (isDirty('docs')) {
    console.error('Docs are not up-to-date ❌ ');
    // process.exit(1);
} else {
    console.log('Docs are up-to-date ✔️ ');
}
