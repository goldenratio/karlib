async function main(): Promise<void> {
  const example_module_name = process.env.EXAMPLE_MODULE_NAME;
  if (typeof example_module_name !== "string") {
    throw new Error("Unable to load example module!");
  }

  if (example_module_name === "main") {
    throw new Error("Very smart, main is not an example!");
  }

  const {
    main: example_main,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  } = await import(`./${example_module_name}.ts`);

  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_WIDTH as number;
  canvas.height = CANVAS_HEIGHT as number;

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
    fontFamily: "Roboto, Helvetica, 'Helvetica Neue', Verdana, Arial, serif",
    fontSize: "16px",
    color: "#000",
    height: "100vh",
    overflow: "hidden",
  });

  document.body.appendChild(canvas);

  await example_main(canvas);
}

main();
