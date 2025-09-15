#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { createGzip } from 'node:zlib';

import { build } from "esbuild";

function bytes_to_kilobytes(bytes: number): number {
  const value = bytes / 1024;
  return Math.round(value * 100) / 100;
}

async function get_gzip_size(file_path: string): Promise<number> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const gzip = createGzip();

    fs.createReadStream(file_path)
      .pipe(gzip)
      .on("data", chunk => {
        size += chunk.length;
      })
      .on("end", () => resolve(size))
      .on("error", reject);
  });
}

async function main(): Promise<void> {
  const start_time = Date.now();

  const src_path = path.join("src", "index.ts");
  const dest_path = path.join("target", "karlib.js");

  console.log(`Building... ${src_path} -> ${dest_path}`);
  await build({
    entryPoints: [src_path],
    outfile: dest_path,
    format: "esm",
    target: "esnext",
    treeShaking: true,
    bundle: true,
    minify: false,
    sourcemap: true,
    drop: ["console", "debugger"],
    define: {
      "process.env.PROD": "true",
    }
  });

  console.log(`Build finished in ${Date.now() - start_time}ms`);
  const gzip_size = await get_gzip_size(dest_path);
  console.log(`${bytes_to_kilobytes(gzip_size)} kb (gzip)`);
}

main();
