#!/usr/bin/env node

import { exec } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const dest_dir = "target";
const example_module_name = process.argv.pop() ?? "";
if (!example_module_name || example_module_name.includes("example_server.js")) {
  console.log("pass an example name to run. Example: npm run example shape_2d");
  process.exit(1);
}

// checks If it is print cmd
if (
  example_module_name === "--help"
  || example_module_name.includes("example_server.ts")
  || example_module_name === ""
) {
  await print_help();
  process.exit(0);
}

async function run_command(cmd: string, options = {}): Promise<void> {
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

async function get_available_example_names(): Promise<string[]> {
  const dir_path = path.resolve("examples");
  const files = fs.readdirSync(dir_path);
  const ignoreFiles = ["res", "main.ts"];

  return files
    .filter(name => !ignoreFiles.includes(name))
    .map(name => name.replace(".ts", ""));
}

async function print_help(): Promise<void> {
  const available_examples = await get_available_example_names();
  console.log("Usage:");
  console.log("npm run example <example_name>");
  console.log("\nAvailable example names:")
  console.log("-", available_examples.join("\n- "));
}

async function main(): Promise<void> {
  const available_examples = await get_available_example_names();

  if (!available_examples.includes(example_module_name)) {
    console.log(`Example: '${example_module_name}' does not exist!`);
    console.log(`Below are the available example names:\n-`, available_examples.join("\n- "));
    process.exit(0);
  }

  console.log(`running example: ${example_module_name}`);

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
