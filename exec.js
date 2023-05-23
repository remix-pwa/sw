#!/usr/bin/env node

/**
 * @fileoverview Supposed to help you avoid typing that long `esbuild` script in your package.json
 * 
 * Usage:
 *  todo: Improve
 */

import { execSync } from "child_process";

if (process.argv.length < 3) {
    console.log("Please provide a name");
    process.exit(1);
}

const build = (
    process.argv.indexOf('-b') > -1 || process.argv.indexOf('--build') > -1 ? true : false
);

const watch = (
    process.argv.indexOf('-w') > -1 || process.argv.indexOf('--watch') > -1 ? true : false
);

// get the filename passed in which can appear before or after the flag
const fileName = (
    (process.argv.indexOf('-b') > -1 && process.argv.indexOf('-b') < 3) || (process.argv.indexOf('--build') > -1 && process.argv.indexOf('--build') < 3) ? process.argv[process.argv.indexOf('-b') + 1] :
        (process.argv.indexOf('-w') > -1 && process.argv.indexOf('-w') < 3) || (process.argv.indexOf('--watch') > -1 && process.argv.indexOf('--watch') < 3) ? process.argv[process.argv.indexOf('-w') + 1] :
            (process.argv.indexOf('-b') > -1 && process.argv.indexOf('-b') > 2) || (process.argv.indexOf('--build') > -1 && process.argv.indexOf('--build') > 2) ? process.argv[process.argv.indexOf('-b') - 1] :
                (process.argv.indexOf('-w') > -1 && process.argv.indexOf('-w') > 2) || (process.argv.indexOf('--watch') > -1 && process.argv.indexOf('--watch') > 2) ? process.argv[process.argv.indexOf('-w') - 1] :
                    process.argv[2]
);

console.log(build, fileName, watch)

if (!fileName.endsWith(".ts") && !fileName.endsWith(".js")) {
    console.log("Please provide a valid service worker file.");
    process.exit(1);
}

if (build) {
    execSync(`esbuild ./app/${fileName} --platform=node --outfile=./public/entry.worker.js --minify --bundle --format=esm --define:process.env.NODE_ENV='\"production\"'`, { stdio: 'inherit' });
} else if (watch) {
    execSync(`esbuild ./app/${fileName} --platform=node --outfile=./public/entry.worker.js --bundle --format=esm --define:process.env.NODE_ENV='\"development\"' --watch`, { stdio: 'inherit' });
}