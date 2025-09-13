const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

async function main(): Promise<void> {
  const example_module_name = process.env.EXAMPLE_MODULE_NAME;
  if (typeof example_module_name !== "string") {
    throw new Error("Unable to load example module!");
  }

  if (example_module_name === "main") {
    throw new Error("Very smart, main is not an example!");
  }

  const { main: example_main } = await import(`./${example_module_name}.ts`);

  const canvas = document.createElement("canvas");
  canvas.width = GAME_WIDTH;
  canvas.height = GAME_HEIGHT;

  Object.assign(canvas.style, <CSSStyleDeclaration>{
    // Style for centering
    display: "block",
    margin: "auto",
    position: "absolute",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
    maxWidth: "100%",
    maxHeight: "100%",
  });


  Object.assign(document.body.style, <CSSStyleDeclaration>{
    backgroundColor: "#6d8891",
    margin: "0",
    height: "100vh",
    overflow: "hidden",
  });

  document.body.appendChild(canvas);

  await example_main(canvas);
}

main();
