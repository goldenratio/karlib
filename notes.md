# Keeping HTML5 Canvas on the GPU Path in Chrome (Without WebGL/WebGPU)

### APIs & patterns to avoid (they trigger CPU work / readback)

- `getContext('2d', { willReadFrequently: true })`<br>
This hint tells Chrome you’ll read pixels a lot → it usually creates a software canvas.

- `getImageData(...)`<br>
Reads pixels back to CPU memory → stalls / breaks the GPU path. (Common pitfall for hit-testing or color picking.)

- `putImageData(...)` (especially large regions or every frame)<br>
Writes raw pixels from CPU → pricey uploads; tends to negate GPU benefits.

- `canvas.toDataURL(...)` / `canvas.toBlob(...)` (inside the render loop)<br>
Requires reading pixels back → CPU sync point. If you must snapshot, do it infrequently and off the hot path.

- Heavy `ctx.filter = '...'` usage (e.g., large blur(), complex chains)<br>
Many filter configurations still fall back or get slow; even when accelerated they can be bandwidth-bound.

- Large shadow effects: shadowBlur, big shadowOffsetX/Y<br>
Expensive; can push rendering to CPU paths or cause big intermediate surfaces.

- Excessive pattern rewrites: `createPattern` on-the-fly each frame<br>
Pre-create and reuse; repeated creation can trigger uploads/copies.

- Massive `drawImage` from dynamic sources every frame (e.g., big `<video>` or another canvas at huge resolutions)<br>
Keep assets sized to what you draw; avoid unnecessary scaling of very large sources.

- Per-frame `measureText` + layout thrash for thousands of strings<br>
Not a readback, but it serializes work; cache metrics and glyph positions.

- Ultra-large canvases (tens of megapixels)<br>
Force tiling / huge textures → can degrade to software on some GPUs. Keep dimensions reasonable and scale with CSS if needed.

### Safer alternatives & tips to stay on the GPU path

- Use a normal 2D context:<br>
`const ctx = canvas.getContext('2d');`<br>
(Avoid `willReadFrequently`; consider `alpha:false` if your canvas is opaque for better compositor integration.)

- Prefer `ImageBitmap` and `createImageBitmap(...)` for images and spritesheets.<br>
They avoid extra decoding/copy steps and are upload-friendly.

- For off-main-thread rendering, use `OffscreenCanvas` with a `'2d'` context in a Worker.<br>
This keeps raster on the compositor/GPU side more often and frees the main thread.

- If you don’t need exact per-pixel collision, avoid `getImageData`; use geometric/physics engine hit-tests, or maintain your own logical grid/bitmask in JS memory (not pulled from the canvas).

- Batch your draws: minimize state changes (globalCompositeOperation, filter, shadow*, setTransform) and overdraw. Reuse paths via Path2D.

- Sprite rendering: pack sprites in atlases, use drawImage with source rects; pre-scale assets to target sizes to avoid per-frame resampling.

- Consider desynchronized: true when you create the context if latency matters:<br>
`canvas.getContext('2d', { desynchronized: true })`<br>
(This can reduce jank by relaxing synchronization with the compositor; test on your target devices.)
