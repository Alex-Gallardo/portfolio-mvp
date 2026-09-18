# Prompt de edición de la escena v5

Fecha: 16 de septiembre de 2026.

## Método y entrada

Herramienta integrada **image_gen**, categoría `precise-object-edit`, una pasada. Única imagen de entrada y objetivo de edición: [escena-limpia-full-hd_v4.png](escena-limpia-full-hd_v4.png).

Se eliminan E08 y E09 por coincidencia exacta del campo `grupo: Monitor; contenido de pantalla`, conservando el monitor E07. El [inventario principal](inventario-objetos.json) se actualiza directamente, sin crear otro JSON.

## Prompt exacto

```text
Use case: precise-object-edit.
Input image: approved scene v4, the ONLY edit target.
Primary request: remove ALL displayed content from the large central computer monitor, preserving the physical monitor. Remove object E08 (the entire graphic software interface, all toolbars, top icons, left tools, panels, sliders, color picker, swatches, controls) and object E09 (the central coffee illustration, its cup, steam, beans and rectangular artwork). Both belong to the group "Monitor; contenido de pantalla".
Replace the full display interior with one clean blank dark charcoal/black screen, naturally unlit with at most an extremely subtle continuous glass shading. The blank area must extend over the entire interior right up to the existing physical bezel: no remaining icons, menu bars, small circles, buttons, panels, coffee art, text, cursor, wallpaper or other screen graphics. Keep E07, the physical black monitor casing/bezel, at exactly the same location, shape and dimensions (approximate bounding box x692–1223, y139–390 in the 1920×1080 input). Do not remove the monitor, do not reveal the wall through the screen, and do not add a stand.

STRICT LOCAL EDIT: preserve everything outside the monitor display as closely as possible, including the composition, camera, warm lighting and materials. Keep the pale wood desk and legs, empty ergonomic office chair, white keyboard, drawing tablet and black stylus, physical cream mug and white oval mouse. Keep the left drawer cabinet and pleated green-base lamp, white ribbed bowl on the rug, golden shag rug and wood floor, yellow antenna device, small cream-framed dark display on the floor, upright calico cat, tall right cabinet, books, green vase and leaf, large right plant and white pot.
Previously removed objects must stay absent: no two product bags on the left, no blue cushion, no large plush cat, no person, no toy rod/fish or pink mascot. Do not remove the physical mug on the desk: only the coffee illustration inside the monitor is removed. Keep one large monitor and one chair.
No added objects, letters, numbers, words, logos, watermarks or floating text. Maintain the same polished warm 3D rendered scene, sharp clean edges, coherent textures, consistent perspective and shadows. Output one high quality landscape image, target 1920×1080 Full HD, same framing.
```

## Archivos y exportación

- [Salida nativa 1672 × 941](escena-limpia-nativa_v5.png).
- [Imagen Full HD 1920 × 1080](escena-limpia-full-hd_v5.png).
- [Reporte de cambios](reporte-v5-monitor-vacio.md).
- [Inventario principal actualizado](inventario-objetos.json).

Se copió la salida nativa desde la carpeta de imágenes generadas de Codex, conservando allí el original. La edición creativa se realizó con image_gen; sharp se utilizó únicamente para exportar a Full HD con Lanczos3, `fit: cover`, `position: centre`, escalado uniforme aproximado de 14,8 % y ajuste central mínimo de proporción.
