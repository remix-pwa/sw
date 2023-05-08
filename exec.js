#!/usr/bin/env node

/**
 * @fileoverview Supposed to help you avoid typing that long `esbuild` script in your package.json
 * 
 * @todo Implement it so that you pass your worker path, then it will build it in a `${fileName}.js` and run it
 */

if (process.argv.length < 3) {
    console.log("Please provide a name");
    process.exit(1);
}

const name = process.argv[2];
console.log(`Hello ${name}`);