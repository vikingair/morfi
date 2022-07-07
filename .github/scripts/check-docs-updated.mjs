import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

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

const listFiles = (dir) => {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((fileOrDir) => {
        const p = path.join(dir, fileOrDir.name);
        return fileOrDir.isDirectory() ? listFiles(p) : [p];
    });
};

const result = await exec('pnpm build',{  cwd: 'frontend' });
const frontendBuildDir = path.join('frontend', 'build');
const allDocsFiles = listFiles('docs').map(p => path.relative('docs', p)).sort();
const allBuildFiles = listFiles(frontendBuildDir).map(p => path.relative(frontendBuildDir, p)).sort();

fs.rmSync(frontendBuildDir, { recursive: true });

if (allDocsFiles.some((name, index) => name !== allBuildFiles[index])) {
    console.error('Docs are not up-to-date ❌ ');
    process.exit(1);
}

console.log('Docs are up-to-date ✔️ ');
