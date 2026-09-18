# Prompts y exportación de la escena

Fecha: 12 de septiembre de 2026.

## Versión v3: escritorio en lugar de O10

Actualización documental: 13 de septiembre de 2026.

La [imagen v3](escena-limpia-full-hd_v3.png) sustituye O10 por los componentes E04–E22 del escritorio. Véanse el [reporte de composición](reporte-v3-escritorio.md), el [inventario v3](inventario-v3-escritorio.json) y el [prompt de composición](prompts-v3-escritorio.md).

Esta documentación histórica cubre las versiones `_v1`, `_v2` y `_v3`; consulta el [índice de versiones](README.md) para la entrega actual. El análisis histórico que sigue mantiene su versión correspondiente; las fuentes originales sin limpiar ya no están incluidas como PNG. Los registros de creación y sus huellas reflejan la entrega original, y los prompts de los bloques de texto se conservan literalmente.

## Edición posterior: retirada de O11–O19

El [prompt de la variante sin O11–O19](prompts-sin-o11-o19.md) está documentado por separado. Produce una [nueva imagen Full HD](escena-limpia-full-hd_v2.png) y conserva el respaldo azul O10. Las dos pasadas descritas a continuación siguen correspondiendo a la creación de la imagen base anterior.

## Herramienta y entradas

Se utilizó la herramienta integrada `image_gen` en dos pasadas. No se utilizó el modo CLI/API. La primera entrada fue la imagen original; la segunda fue el resultado limpio de la primera pasada.

La primera salida fue descartada como entrega final porque incluía un cuenco beige adicional. Se conserva como resultado seleccionado únicamente la segunda salida, en [escena-limpia-nativa_v1.png](escena-limpia-nativa_v1.png). La referencia original ya no está incluida como PNG en la organización actual; se conservan sus metadatos históricos.

## Pasada 1: limpieza y reconstrucción

El siguiente es el prompt exacto enviado al generador:

```text
Use case: precise-object-edit.
Asset type: high-quality cleaned 3D illustration, final Full HD landscape image.
Input image 1 is the EDIT TARGET, not merely inspiration. Faithfully restore the provided composition and every visible object, preserving their shapes, placement relative to each other, proportions, colors, expressions, interaction, and warm soft 3D plush-toy illustration style.
Primary request: Remove ALL lettering, text, Chinese characters, English words, logos, branding, signatures, watermarks, typographic signs and printed music-note glyphs everywhere. Seamlessly reconstruct the warm taupe wall in the entire former headline area. Packaging remains physically present with its original white/pink and yellow/lavender color blocking, but every surface is clean and unprinted; books have blank spines, the small display has a blank dark screen, and the yellow music device has an unmarked dark speaker opening without any printed music symbols. Decorative blue round buttons and antenna tips remain. No added text of any kind.
Scene and object invariants: warm beige living room. At far left the partly cropped cream two-drawer cabinet with small handles, topped by a small lamp with pleated cream shade and rounded light green base. Two upright pet-product pouches stand on the floor at lower left: front white/pink/lavender pouch, back yellow/lavender pouch. A small light-colored pet bowl lies to their right. Center: large curled cat-shaped plush lounge on a curved light-blue padded backing, purple/lavender head facing upper right with cream muzzle and forehead, closed happy dark eye, delicate dark whiskers, pink nose, orange ear interior; plump orange/gold curled body with cream paws and cream upper belly, turquoise bands at raised front paw. A small magenta character accessory with white face, cream belly, dark facial markings and raised tiny arm hangs beside the cat's left cheek. A small stylized human figure reclines in the center, brown ponytail, cream headband, light blue dress/clothing, bent legs with pink feet raised behind, looking down toward their hands; keep pose and scale, refine fingers and anatomy only where visible, do not invent a book. A thin blue cat-teaser rod angles upward left from the hands; its fine dangling cord ends in a small orange/yellow fish-like toy above the plush cat's face. Large soft golden-beige rug across floor. Lower right behind small screen: rounded pale-yellow music-device-like toy with two blue-tipped antennae, three blue circular front buttons, large dark brown round front opening, NO symbols. In front of it a small cream-framed rectangular dark display tilted slightly in perspective. To its right a small white calico cat standing upright on hind legs looking up, orange and dark patches, raised front paws and curved tail. Far right cream storage cabinet: top open cubby with a light-green vase and dark green elongated leaf, several upright pale cream/mint books and horizontal mint book underneath; lower cream drawer and cupboard with small knobs. Foreground far right large green broad-leaf plant with white pot partially cut by the outer frame. Preserve all these scene elements and their ordering.
Quality: remove blur, compression artifacts, stair-step jagged edges, white image border and noise; render precise smooth silhouettes and coherent perspective, fine individually resolved plush fur, woven rug fibers, subtle fabric folds and clean matte furniture. Soft warm illumination, gentle believable contact shadows. Highly detailed, polished and visually consistent, no crunchy oversharpening, no plastic-looking fur. This remains a stylized 3D illustration, not a realistic photograph.
Composition/framing: Deliver EXACTLY 1920 x 1080 pixels, landscape 16:9 Full HD. The original is wider than 16:9: preserve the entire original horizontal scene and relative arrangement, and naturally extend only the quiet taupe wall above and the matching floor below to fit 16:9. Do not squeeze, stretch or crop away objects; retain the original intentional partial cropping of the outer furniture/plant. No added props, extra characters, borders, black bars, panels, labels or collage. One single full-frame finished image.
```

## Pasada 2: retirada del cuenco adicional

El siguiente es el prompt exacto de la corrección:

```text
Use case: precise-object-edit.
Input image 1 is the edit target: the newly cleaned 3D room illustration.
Make ONE local correction only: remove the broad smooth beige/yellow pet bowl on the foreground rug immediately to the left of the small white ribbed bowl (at approximately x 228-366, y 668-722 in this 1672x941 image). Reconstruct only the matching golden rug fibers and soft floor shadows where that beige bowl was. KEEP the single small white ribbed bowl exactly in place. This correction avoids an extra prop that was not clearly present in the source.
Preserve every other pixel region and all existing objects as closely as possible: same cat-shaped plush lounge with purple head/orange body/cream paws/turquoise bands/light blue backing, reclining brown-haired figure and pose, blue rod/cord/orange fish, hanging magenta mascot, two blank product pouches, cream furniture and lamp, books and vase/leaf, yellow unmarked device with blue buttons and antennae, blank dark display, upright small calico cat, large plant/pot, carpet, extended wall and floor, illumination, colors, high-detail fur, framing. Do not add anything, no texts, letters, logos, numerals, music-note glyphs or watermarks.
Deliver the finished single image as EXACT 1920 x 1080 pixels, Full HD landscape 16:9, the same framing and composition, no borders.
```

## Exportación a Full HD

El generador devolvió 1672 × 941 píxeles en ambas pasadas, pese a solicitar 1920 × 1080. La salida seleccionada se exportó a PNG RGB de 1920 × 1080, con escalado uniforme mediante Lanczos3 y ajuste central mínimo de la proporción (`fit: cover`, `position: centre`). No se hizo otra modificación creativa en esta exportación.

La diferencia de proporción es mínima y el ajuste afecta aproximadamente un píxel de altura según redondeo. La adaptación importante del original panorámico a 16:9 se hizo dentro de image_gen ampliando pared y suelo.

El resultado es [escena-limpia-full-hd_v1.png](escena-limpia-full-hd_v1.png). Los detalles de análisis, límites y control visual constan en [reporte-analisis.md](reporte-analisis.md).
