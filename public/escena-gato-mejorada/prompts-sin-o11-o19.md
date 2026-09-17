# Prompt de la variante sin O11–O19

Fecha: 12 de septiembre de 2026.

## Versión v3: escritorio en lugar de O10

Actualización documental: 13 de septiembre de 2026.

La [imagen v3](escena-limpia-full-hd_v3.png) sustituye O10 por los componentes E04–E22 del escritorio. Véanse el [reporte de composición](reporte-v3-escritorio.md), el [inventario v3](inventario-v3-escritorio.json) y el [prompt de composición](prompts-v3-escritorio.md).

Los nombres actuales usan los sufijos `_v1`, `_v2` y `_v3`. El análisis histórico que sigue mantiene su versión correspondiente; las fuentes originales sin limpiar ya no están incluidas como PNG. Los registros de creación y sus huellas reflejan la entrega original, y los prompts de los bloques de texto se conservan literalmente.

## Método

Edición con la herramienta integrada `image_gen`, una pasada, sobre [escena-limpia-full-hd_v1.png](escena-limpia-full-hd_v1.png). Se retiraron nueve registros y se conservó expresamente O10, además de O20 y O22.

## Prompt exacto

```text
Use case: precise-object-edit.
Input image 1 is the EDIT TARGET: the previously approved clean Full HD plush living-room illustration. Edit this exact image locally, do not redesign the room.
Primary request: remove exactly the inventory objects O11 through O19 inclusive, while retaining O10 and every object outside that range.
REMOVE completely:
O11 the large lavender/purple plush cat head, including ears, cream face, eyes, nose, mouth and whiskers.
O12 the entire large orange/golden plush cat body and cream belly.
O13 its raised cream/orange front paw and ALL turquoise/blue/orange wrist bands.
O14 the raised right cream paw and golden curled tail/hindquarter of that large cat.
O15 the reclining brown-haired human figure, including hair, headband, face, clothes, all limbs and pink feet.
O16 the thin blue toy rod.
O17 the entire dangling blue cord.
O18 the small orange fish lure.
O19 the small magenta hanging mascot, including face, paws, tail, dark cap/backing/strap and attachment.
Leave NO fragments of the removed subjects, no colored fur remnants, human parts, poles, thread, fish, mascot, ghost outlines or their cast shadows.

CRITICAL RETAIN O10: the existing pale-blue padded backing and base BEHIND the big plush cat is a SEPARATE retained object. Keep it in precisely the same central position, overall size and original outside silhouette. Its contour has two tall smoothly rounded ends and a lower smooth concave middle along the back's top edge, with a wide rounded bottom supporting it on the rug. Reconstruct the previously hidden portions as continuous matching pale-blue upholstered padding with believable thickness, fine consistent fabric/plush texture and soft shading. It should read as the SAME now-unoccupied blue cushioned backing/base, with a simple empty inner padded surface. Do not remove it, turn it into a blue cat, add any face/ears/tail/paws, or replace it with a different sofa design, new armrests, extra seat pillows, tufted buttons or new furniture. Preserve all visible parts and the original silhouette rather than inventing a wider or taller couch. The large orange/lavender cat was in front of this blue padding; after removal the blue support remains, revealed but empty.

Preserve ALL other existing objects and framing as closely as possible:
warm taupe wall; pale wood floor; golden-beige textured rug; left cream drawer cabinet; pleated cream lamp shade and green rounded lamp base; the TWO blank white/pink/lavender and yellow/lavender product pouches at lower left; ONE small ribbed white bowl; the pale-yellow rounded device at lower right with two blue-tipped antennae, three blue round buttons and a dark empty front opening; the small cream-framed blank dark screen in front of that device; the SMALL standing white/orange/dark CALICO CAT at right with raised paws and its tail (this is O22 and MUST stay); right cream cabinet with green vase, dark green leaf, four vertical pale books and one horizontal green book; large right-side green plant and white pot at the frame edge.
Preserve all those objects' positions, appearances, scale, count, materials, colors and contact shadows. In particular retain the small right calico cat, the blue padded support and the yellow device. Do NOT delete all cats indiscriminately.

Reconstruct only the surfaces exposed by the removals: matching taupe wall behind the toy rod/fish, continuous blue padding behind the big cat/human/mascot, and limited matching carpet or device edges where previously covered. Newly exposed upholstery is an inferred reconstruction; keep it visually restrained and coherent.
Maintain the polished warm 3D render style, crisp clean edges, fine fibers, soft diffuse warm illumination, original perspective and no visible text, logos, letters, music-note glyphs or watermarks. No new objects and no added people.
Output a single finished image, exactly 1920 x 1080 pixels Full HD, 16:9 landscape. Identical framing and no cropping, camera move, zoom, stretching, border or collage.
```

## Salida y exportación

La salida nativa seleccionada se conserva en [escena-limpia-nativa_v2.png](escena-limpia-nativa_v2.png), de 1672 × 941.

Se exportó a 1920 × 1080 mediante escalado uniforme Lanczos3 y ajuste central mínimo (`fit: cover`, `position: centre`). La adaptación geométrica es de aproximadamente un píxel de altura según redondeo. No se hizo otra edición creativa fuera del generador.

- [Imagen final Full HD](escena-limpia-full-hd_v2.png).
- [Reporte de análisis y cambios](reporte-sin-o11-o19.md).
- [Inventario de la variante](inventario-sin-o11-o19.json).

La imagen base se conserva. La nueva superficie interior de O10 es una reconstrucción inferida, no una recuperación exacta de lo que había detrás del gato.
