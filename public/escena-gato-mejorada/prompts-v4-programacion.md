# Prompt de la variante v4 con programación

Fecha: 18 de septiembre de 2026.

## Entrada y método

Herramienta **image_gen integrada**, categoría `precise-object-edit`, una pasada.

La única entrada es [escena-limpia-full-hd_v4.png](escena-limpia-full-hd_v4.png), objetivo de edición. Se reemplaza el grupo `Monitor; contenido de pantalla` por una interfaz de programación. Los archivos de esta entrega son independientes de v4 y v5.

## Prompt exacto

```text
Use case: precise-object-edit.
Input image: the approved v4 room scene, used as the ONLY image to edit.
Replace ONLY the graphic content inside the large central computer monitor with a convincing programming editor interface inspired by Visual Studio Code. The user explicitly requests CODE LINES and a FILE LIST, both clearly visible in the monitor. Preserve the physical black monitor frame/casing E07 and every object outside its display.
Remove the old graphic-design software, its color picker, sliders, tool panels and coffee illustration completely. Fill the display interior with a clean dark VS Code style interface:
- narrow left activity bar with small familiar editor icons;
- a left EXPLORER sidebar showing a small expanded file tree: PORTFOLIO, src, components, App.tsx, styles.css, package.json, README.md. Indent folders/files consistently and use small colored file icons;
- top editor tabs with App.tsx active and styles.css inactive;
- a spacious main code editor with a visible line-number gutter, aligned monospace text, proper indentation, and syntax highlighting in soft blue, violet, amber, green and warm white;
- a thin blue status bar along the bottom.
Prioritize a simple credible, readable code snippet over dense tiny text. Display approximately these 11 short lines in the editor:
const name = "Developer";
const skills = ["React", "TypeScript"];

export default function App() {
  return (
    <main>
      <h1>{name}</h1>
      <p>Welcome to my portfolio</p>
    </main>
  );
}
Keep all code and filenames confined to the actual display. The editor should look like software displayed on glass, integrated with the existing scene's lighting, not a floating caption or a pasted poster. No coffee artwork, design-tool panels or extra windows inside the screen.
STRICT PRESERVATION: same composition, camera, dimensions and placement of the large monitor, central pale wood desk and legs, empty ergonomic chair, keyboard, black drawing tablet and stylus, physical cream mug, small white mouse. Keep the side cabinets, green-base pleated lamp, white ribbed bowl on the gold rug, wooden floor, yellow device with blue antennae, small cream-framed dark screen on the rug, upright small calico cat, books, green vase and leaf, large plant and white pot. Keep the physical mug on the desk; only the coffee illustration inside the monitor is replaced. Keep the two left product bags absent, the blue cushion absent, and the previously removed large plush cat, person and toys absent. No new people, no floating text, no watermark, no new furniture or props. Text is authorized only as programming interface content inside the monitor.
Match the original warm polished 3D render, clean edges and realistic soft shadows. Preserve all pixels outside the monitor as closely as the editing process permits. One high quality landscape Full HD image, target 1920×1080, same framing.
```

## Archivos y exportación

- [Imagen Full HD, 1920 × 1080](escena-limpia-full-hd_v4-programacion.png).
- [Salida nativa, 1672 × 941](escena-limpia-nativa_v4-programacion.png).
- [Inventario independiente](inventario-v4-programacion.json).
- [Reporte de análisis](reporte-v4-programacion.md).

La salida generada se copió desde el directorio de imágenes de Codex, conservando allí el original. La edición del contenido visual se realizó con image_gen; sharp se utilizó únicamente para exportar a Full HD mediante Lanczos3, `fit: cover` y `position: centre`.

El código del prompt especifica el contenido visual deseado; la imagen contiene una interpretación rasterizada y puede variar en detalles tipográficos o en el fragmento visible.
