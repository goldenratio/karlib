async function main(): Promise<void> {
  const example_module_name = process.env.EXAMPLE_MODULE_NAME;
  if (typeof example_module_name !== "string") {
    throw new Error("Unable to load example module!");
  }

  const { main: example_main } = await import(`./${example_module_name}.ts`);
  await example_main();
}

main();
