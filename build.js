#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createGzip } from 'node:zlib';

import { build } from "esbuild";

const destDir = "dist";

function bytes_to_kilobytes(bytes) {
  const value = bytes / 1024;
  return Math.round(value * 100) / 100;
}

async function get_gzip_size(filePath) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const gzip = createGzip();

    fs.createReadStream(filePath)
      .pipe(gzip)
      .on("data", chunk => {
        size += chunk.length;
      })
      .on("end", () => resolve(size))
      .on("error", reject);
  });
}

async function main() {
  const startTime = Date.now();

  console.log("Building...");
  await build({
    entryPoints: [path.join("src", "index.ts")],
    outfile: path.join("target", "karlib.js"),
    format: "esm",
    target: "esnext",
    treeShaking: true,
    bundle: true,
    minify: false,
    sourcemap: false,
    drop: ["console", "debugger"]
  });

  console.log(`\nBuild finished in ${Date.now() - startTime}ms`);
}

main();
