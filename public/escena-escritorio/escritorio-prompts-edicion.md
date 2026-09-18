# Prompts de edición del escritorio

Fecha: 12 de septiembre de 2026.

## Uso del conjunto en la escena v3

Actualización documental: 13 de septiembre de 2026.

Los componentes **E04–E22** se incorporaron a la [escena v3 de la habitación](../escena-gato-mejorada/escena-limpia-full-hd_v3.png). El [reporte de composición](../escena-gato-mejorada/reporte-v3-escritorio.md) y el [inventario de la v3](../escena-gato-mejorada/inventario-v3-escritorio.json) registran sus posiciones nuevas. Esta carpeta sigue documentando la imagen donante del escritorio.

Las rutas actuales pertenecen a `public/escena-escritorio/`. Los registros de creación y las huellas históricas siguientes describen la entrega original; el PNG de referencia sin limpiar ya no está incluido. Los prompts dentro de los bloques de texto se conservan literalmente.

## Método y selección

Se utilizó la herramienta integrada `image_gen`. La primera entrada fue la referencia original histórica; ese PNG ya no está incluido en la carpeta actual. Las siguientes pasadas editaron el resultado inmediatamente anterior.

Se generaron tres pasadas. **La segunda es la seleccionada y guardada** en [escritorio-limpio-nativa.png](escritorio-limpio-nativa.png). La tercera prueba no aportó una mejora clara del teclado y alteró parte del patrón de la alfombra; se descartó como entrega final.

## Pasada 1: retirar persona y texto; reconstruir escena

```text
Use case: precise-object-edit.
Asset type: cleaned premium 3D/product-composite office still life, Full HD landscape.
Input image 1 is the EDIT TARGET. Analyze and faithfully edit the supplied image. Preserve the existing objects, relative arrangement, materials, colors, proportions, frontal camera view and floating-object visual concept.
Primary request: Completely REMOVE the single human sitting at the desk, including head, hair, neck, blue shirt, arms, hands, trousers, legs and shoes. Keep the ergonomic black/gray office chair, empty, viewed from behind and still facing the monitor. Reconstruct naturally the parts of the monitor, desk surface, keyboard, drawing tablet, chair, chair mechanism, rug and background that the human occluded. No people, faces, human body parts, clothes, ghost silhouettes, reflections of people or new characters anywhere.
Text removal: completely remove the large floating black headline reading Hard work. from the upper wall. Seamlessly reconstruct plain warm beige background. Consistent with the prior cleaning brief, also remove ALL other lettering, words, numbers, logos, watermarks and readable text on screen, keyboard keycaps, paper sheets and objects. The screen keeps a recognizable dark graphics-editor workspace with clean geometric tool shapes and panels, a small red/green color picker, a central cream/coffee-brown graphic with coffee beans and a coffee cup still life, but no words or typographic marks on the artwork or interface. Do not blank out the entire monitor; preserve the original graphic design context. Papers are blank; keyboard has physically distinct blank keys.
Object inventory to preserve: large slim black widescreen monitor centered above wooden desk, with original approximately 2:1 screen aspect ratio; a simple warm pale wood desk with slender slightly splayed legs and apron/crosspieces; empty black upholstered/mesh ergonomic chair with gray structural back frame, two armrests, seat, central metal lift column and coherent five-spoke caster base; red patterned Persian-style rectangular rug in perspective under desk/chair, with cream/tan/brown floral and geometric border patterns, nonlinguistic ornament only; small white keyboard on desktop left; dark slim drawing tablet on desktop right; the small dark drawing stylus formerly held by the human should remain as an accessory, now resting naturally on the drawing tablet; small cream mug with handle on desktop right; tiny white oval mouse near mug.
Floating objects stay in their source positions relative to the desk and one another: at upper left a fanned multicolor printed swatch deck with white separators (colored rectangular swatches, no labels), below it a slightly tilted small stack of blank white paper sheets, and below that a small vintage gray/black CRT television with blank gray reflective screen, side knobs and slender antenna. At upper right a slightly tilted dark smartphone with blank charcoal screen, next to/below it a vintage black telephone receiver connected by a coiled cable to its matching dark sloped rotary telephone base lower down; separately a black-and-gold fountain pen on a diagonal at far right. Keep a single phone receiver and its base, one smartphone, one CRT TV, one fountain pen, one stylus, one mug, one mouse; do not duplicate objects. Keep the monitor floating/visually unsupported as in the reference; do not add a monitor stand, laptop, extra screens, props, furniture or cables.
Scene/backdrop: seamless warm ivory/beige studio-like wall and floor, no horizon line required, soft grounded desk/chair/rug contact shadows; no graphic text anywhere.
Quality: meticulously refine edges, reduce blur and compression artifacts, improve realistic material rendering, wood grain, chair fabric and metal, CRT glass, phone cord, paper edges, coffee illustration and rug motifs. Preserve tasteful restrained realism of the supplied product-composite scene; do not turn it into a plush toy illustration. Soft warm diffuse lighting, coherent perspective and contact shadows, sharp clean finish without oversharpening halos.
Composition/output: one finished image, EXACTLY 1920 x 1080 pixels, Full HD landscape 16:9. The source is almost square: extend the existing quiet beige background laterally to obtain 16:9 while preserving the full original desk/objects/rug arrangement and undistorted object proportions. Keep the entire rug, desk legs, all floating props and chair wheels within the frame, with modest breathing room. No cropping of required objects, stretching, borders, letterbox bars, collages, text overlays or extra objects.
```

## Pasada 2: limpiar interfaz y controles; apoyar el lápiz

Esta es la última pasada aplicada al resultado seleccionado.

```text
Use case: precise-object-edit.
Input image 1 is the EDIT TARGET: the cleaned empty designer workspace.
Make a strictly localized typography-cleanup pass. The human and floating headline have already been removed correctly; keep them absent. Preserve the entire composition, all objects, sizes, lighting, colors, materials, furniture, empty chair, rug, floating swatches/papers/CRT/phone/fountain pen, coffee artwork, and framing.
Remove the remaining tiny white text/letter-like glyphs from the monitor interface. Replace the very top menu/toolbar rows with a clean flat charcoal bar containing only a few plainly geometric squares and circles, NO characters, tiny strokes resembling text, numbers, alphabet-shaped tool icons, words or menu labels. The right sidebar must keep the red-to-white/black color picker and thin rainbow strip, plus simple unlabelled slider tracks, round handles and large blank rectangular gray panels/color swatches, without text-like horizontal micro-marks or label rows. The left toolbar may have only simple circle/square shapes without letters or pictographic glyphs. Preserve the central coffee cup and beans poster exactly without any text. Preserve the screen frame and original aspect ratio.
Remove dark letters and numbers from every white keyboard keycap; the key tops must be uniformly blank, with only physical key gaps and shading. Also remove any digits on the rotary phone dial and labels near television controls; use blank material surfaces or simple round mechanical holes with no marks. Keep the screen of the smartphone and CRT blank.
Small physical refinement: place the existing dark stylus flat on the existing drawing tablet, on a diagonal inside its surface, clearly resting on it with a subtle contact shadow, instead of appearing suspended above it. Keep exactly one stylus; do not add a hand, holder or prop.
No new objects, text, people, body parts, logos, signatures or watermarks. No other redesign or changes. Keep high-quality crisp material detail and the full unclipped rug and floating props.
Output: EXACT 1920 x 1080 pixels, Full HD 16:9 landscape; if needed preserve the current framing with an imperceptible uniform size adjustment.
```

## Pasada 3: prueba de limpieza de teclado, no seleccionada

Se conserva el prompt para documentar la revisión. Esta pasada no forma parte del PNG final.

```text
Use case: precise-object-edit. Input image 1 is the edit target.
Make only one small local correction: the white keyboard at pixel rectangle x=590..731, y=438..461 in this 1672x941 image still has dark printed marks on its keycaps. Remove ALL of those dark keycap marks, letters, numbers and symbols. Reconstruct it as a white keyboard with completely BLANK, unprinted, smooth white individual rectangular key tops. Keep fine neutral gray shadows ONLY in the gaps BETWEEN keys; no black dots or marks ON key tops. Preserve its shape, perspective and partially hidden right end behind the chair. This is a blank-keycap keyboard.
Everywhere else preserve the input image as closely as possible: same empty office chair, desk, monitor with text-free geometric interface and coffee art, rug, all floating objects, flat resting stylus, mug, mouse, lighting, materials, exact layout and 16:9 framing. No people, body parts, clothing, texts, words, logos or watermarks. Do not add, remove or redesign any other object.
Deliver one high-quality Full HD 1920 x 1080 image.
```

## Exportación

La segunda salida mide 1672 × 941. Se exportó a **1920 × 1080** mediante escalado uniforme con Lanczos3 y ajuste central mínimo (`fit: cover`, `position: centre`). La diferencia de proporción representa aproximadamente un píxel de altura según redondeo.

La retirada de la persona, la limpieza creativa, la reconstrucción y la extensión lateral del fondo se realizaron con image_gen. La exportación solo normaliza dimensiones; no es una generación nativa Full HD.

Resultado: [escritorio-limpio-full-hd.png](escritorio-limpio-full-hd.png).

Análisis, inventario, certezas y límites: [escritorio-reporte-analisis.md](escritorio-reporte-analisis.md).
