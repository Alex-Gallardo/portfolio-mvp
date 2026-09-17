# Prompt de edición de la escena v4 sin envases

Fecha: 13 de septiembre de 2026.

## Entrada y método

- Herramienta: **image_gen integrada**.
- Categoría: `precise-object-edit`.
- Pasadas: una.
- Única imagen de entrada, objetivo de edición: [escena-limpia-full-hd_v3.png](escena-limpia-full-hd_v3.png).
- Solicitud aplicada: crear una copia y eliminar O07 y O08, los dos envases de la izquierda.
- Los componentes E04–E22 ya estaban en la v3; no se envió otra vez la imagen del escritorio.

## Prompt exacto enviado

```text
Edit the attached reference image locally and minimally. It is the approved v3 scene. Produce a new v4 copy removing exactly TWO objects: the two upright product bags at the LOWER LEFT in front of the cream drawer cabinet. Object O07 is the white bag with pink and lavender panels (approximately x49–182, y586–819 on the 1920×1080 reference). Object O08 is the adjacent yellow bag with lavender panels (approximately x182–322, y567–802). Completely remove both bags, every remnant of their packaging, and their cast shadows or colored reflections. Seamlessly reconstruct what their removal reveals: the cream drawer cabinet lower front, its base/feet as needed, pale natural wood floor, and the gold shag rug left edge. Match existing perspective, lighting, surfaces, floor planks, and contact shadows. Leave the newly exposed space empty.
STRICT PRESERVATION: preserve the overall composition, camera, aspect ratio, object placement, colors, and warm soft 3D rendered style. This is a localized object removal, not a redesign. The small white ribbed bowl to the RIGHT of the bags (O09, around x397–484, y755–818) MUST remain. Keep all of the central desk, legs, empty ergonomic office chair, large monitor frame (E07), dark graphic design interface (E08), coffee illustration, keyboard, drawing tablet, stylus, ceramic mug, and small white mouse. O07 and O08 refer to the BAGS, not E07/E08 inside the workstation. Keep the pleated green-base lamp and left cabinet, wall, wooden floor, gold rug, yellow antenna device, small cream-framed black display on the rug, upright calico cat, right tall cream cabinet, books, green vase and leaf, tall right plant and white pot.
Do not add new objects, bags, text, letters, numbers, logos, watermarks, people, blue cushion, large plush cat, toys or floating objects. Retain a single monitor and a single chair. Preserve all existing content outside the local bag-removal region as closely as possible; crisp clean edges and coherent detailed textures, no ghosting or blur. Deliver a high quality landscape Full HD 1920×1080 image matching the reference framing.
```

## Salida y exportación

- [Salida nativa: 1672 × 941](escena-limpia-nativa_v4.png).
- [Imagen Full HD: 1920 × 1080](escena-limpia-full-hd_v4.png).
- [Reporte y revisión visual](reporte-v4-sin-envases.md).
- [Inventario v4](inventario-v4-sin-envases.json).
- [Índice de versiones](README.md).

La herramienta guardó el PNG generado en el directorio de imágenes de Codex. Se copió a esta carpeta como salida nativa y se conservó el archivo generado original. La exportación Full HD se realizó con sharp, interpolación Lanczos3, `fit: cover` y `position: centre`: escalado uniforme aproximado de 14,8 % con ajuste central mínimo de proporción. La eliminación creativa de objetos se hizo íntegramente con image_gen; sharp se usó únicamente para la exportación.

La v3 y las demás imágenes previas permanecen intactas. El prompt pide conservación local, pero la edición generativa no garantiza igualdad exacta de todos los píxeles externos a la zona modificada.
