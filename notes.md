# Keeping HTML5 Canvas on the GPU Path in Chrome (Without WebGL/WebGPU)

### APIs & patterns to avoid (they trigger CPU work / readback)

NOTE: Try not to use below APIs in a render loop. If you have to use it, then use them in OffscreenCanvas and convert it to `ImageBitmap` and cache it.

- `getContext('2d', { willReadFrequently: true })`<br>
This hint tells Chrome you'll read pixels a lot. It usually creates a software canvas.

- `getImageData(...)`<br>
Reads pixels back to CPU memory, stalls / breaks the GPU path. (Common pitfall for hit-testing or color picking.)

- `putImageData(...)` (especially large regions or every frame)<br>
Writes raw pixels from CPU, causes pricey uploads, tends to negate GPU benefits.

- `canvas.toDataURL(...)` / `canvas.toBlob(...)` (inside the render loop)<br>
Requires reading pixels back, CPU sync point. If you must snapshot, do it infrequently and off the hot path.

- Heavy `ctx.filter = '...'` usage (e.g., large blur(), complex chains)<br>
Many filter configurations still fall back or get slow, even when accelerated they can be bandwidth-bound.

- Large shadow effects: `shadowBlur`, big `shadowOffsetX/Y`, can push rendering to CPU paths or cause big intermediate surfaces.

- Excessive `createPattern` on-the-fly for each frame. Try to pre-create them and reuse.

- Massive `drawImage` from dynamic sources every frame (e.g., big `<video>` or another canvas at huge resolutions)<br>

- Avoid `measureText` on each frame.

- Ultra-large canvases, Keep dimensions reasonable and scale with CSS if needed. Keep canvas width and height, less than 800x600.

### Safer alternatives & tips to stay on the GPU path

- When creating context 2d, set `willReadFrequently: false` and consider `alpha:false`.

- Always use `ImageBitmap` and `createImageBitmap(...)` for images and spritesheets.<br>

- When working with text pre-render them in `OffscreenCanvas`, and transfer them to image bitmap and render it in your main canvas.

### Useful Reading

- [It's always been you, Canvas2D](https://developer.chrome.com/blog/canvas2d/)
- [Optimizing canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas)
- [Improving HTML5 Canvas performance](https://web.dev/articles/canvas-performance)
- https://www.reddit.com/r/webgl/comments/sc4024/is_webgl_fast_than_canvas_api_for_drawing_a_bunch/
