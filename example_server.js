#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dest_dir = "target";
const example_module_name = process.argv.pop();
if (!example_module_name || example_module_name.includes("example_server.js")) {
  console.log("pass an example name to run. Example: npm run example shape_2d");
  process.exit(1);
}

async function run_command(cmd, options = {}) {
  return new Promise((resolve, reject) => {
    const proc = exec(cmd, { ...options });
    proc.stdout?.pipe(process.stdout);
    proc.stderr?.pipe(process.stderr);
    proc.on("close", code => {
      if (code !== 0) reject(new Error(`${cmd} exited with ${code}`));
      else resolve();
    });
  });
}

async function main() {
  try {
    if (fs.existsSync(dest_dir)) {
      fs.rmSync(dest_dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dest_dir, { recursive: true });

    // copy resources
    const res_dir = path.resolve("examples", "res");
    const files = fs.readdirSync(res_dir);
    for (const file of files) {
      const src_path = path.join(res_dir, file);
      const dest_path = path.join(dest_dir, file);
      fs.copyFileSync(src_path, dest_path);
    }


    const esbuild_path = path.join("node_modules", ".bin", "esbuild");
    const cmd = [
      esbuild_path,
      "./examples/main.ts",
      "--bundle",
      `--outdir=${dest_dir}`,
      "--sourcemap=inline",
      "--watch",
      `--servedir=${dest_dir}`,
      `--define:process.env.PROD='false'`,
      `--define:process.env.EXAMPLE_MODULE_NAME='"${example_module_name}"'`,
    ].join(" ");

    run_command(cmd);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
