# Prompt de composición de la escena v3

Fecha: 13 de septiembre de 2026.

## Copia posterior v4: sin O07 y O08

La [imagen v4](escena-limpia-full-hd_v4.png) elimina los dos envases de la izquierda. El [reporte v4](reporte-v4-sin-envases.md), el [inventario v4](inventario-v4-sin-envases.json) y el [prompt v4](prompts-v4-sin-envases.md) documentan el cambio. Este archivo conserva la descripción de la v3, donde ambos envases siguen presentes; O09 y los componentes del monitor E07/E08 se mantienen en las dos versiones.

## Entradas y método

Herramienta integrada `image_gen`, modo `compositing`, una pasada.

1. **Imagen base:** [escena-limpia-full-hd_v2.png](escena-limpia-full-hd_v2.png).
2. **Donante selectivo:** [escritorio-limpio-full-hd.png](../escena-escritorio/escritorio-limpio-full-hd.png).

Se retira O10 de la primera imagen y se integran E04–E22 de la segunda. Los nombres de grupo superpuestos se deduplican.

## Prompt exacto

```text
Use case: compositing.
Asset type: version 3 of an existing polished Full HD living-room scene.

INPUT ROLES:
Image 1 is the BASE EDIT TARGET: the clean living-room scene containing a large empty blue upholstered support, golden-beige rug, cream cabinets, pouches, lamp, yellow device, small calico cat, and plant.
Image 2 is a SELECTIVE OBJECT DONOR: the clean designer's desk scene. Transfer ONLY its central desk/monitor/empty-chair/desktop-accessories ensemble described below. Image 2 is not a replacement room or background.

PRIMARY EDIT:
Completely remove object O10 from Image 1: the ENTIRE large blue upholstered backing and base in the middle, including both rounded high ends, central back, thick lower padded lip, every blue fabric fragment, and its obsolete shadow.
In the vacated central space, integrate ONE coherent workspace from Image 2, preserving the donor objects' identity, materials, proportions and relationships while matching Image 1's camera and warm lighting. Reconstruct the original taupe wall and golden rug wherever the blue support was and is now uncovered.

SELECTED DONOR INVENTORY — transfer each object/component exactly once:
E04–E06 "Escritorio": pale warm wood tabletop, under-table apron/crosspieces, and its slender slightly splayed wooden legs.
E07–E09 "Monitor" and "Monitor; contenido de pantalla": ONE slim black landscape widescreen monitor, the dark graphical editing interface with simple circles/squares/sliders, a small red gradient color picker and rainbow strip, and the central vertical cream/caramel coffee-cup, steam and coffee-beans illustration. The monitor remains visually unsupported/floating just above the tabletop as in Image 2; no added stand. The interface and artwork contain no words, letters, numbers or logos.
E10–E14 "Accesorios del escritorio": ONE small white keyboard at left on the tabletop with blank white keys, ONE slim dark drawing tablet at right, ONE black stylus resting diagonally flat on that tablet, ONE small cream mug with its handle, and ONE little white oval mouse near the mug. Retain their placement relationships and sizes.
E15–E22 "Silla de oficina": ONE complete empty black/gray ergonomic office chair, seen from behind facing the monitor, with dark mesh backrest, gray rear supporting frame, upholstered gray seat, left and right armrests, central metal lift column, five-spoke gray base and black casters. No person, head, clothes or human body parts.

The user's overlapping group names identify components of this ONE ensemble; do not duplicate desks, monitors, chairs or accessories.
Do NOT import the donor's red patterned rug, beige donor background, color-swatch fan, floating papers, CRT TV or its antenna, floating smartphone, antique telephone receiver/cable/base, or floating black-and-gold fountain pen. Those donor elements were not selected.

PLACEMENT AND SCALE:
Keep Image 1's framing exactly, 16:9, no camera move, no zoom or crop. Place the assembled workspace in the central space previously occupied by the blue support, centered near x=950 of a 1920-pixel-wide canvas. Scale the donor ensemble proportionally as a group to fit comfortably between the white bowl/pouches on the left and yellow device/small screen on the right. Aim for a tabletop about 700–780 pixels wide. Ground the desk's feet around y=800 on the existing gold rug; the chair is just in front, with its wheels around y=860, still entirely within the rug. The monitor may extend upward onto the existing empty central taupe wall (approximately y=130–380) to preserve the ensemble's natural proportions; do not squeeze the entire workspace into the old cushion's short height. Keep the desk and chair fully visible, with a realistic empty working space between chair and tabletop. These coordinates are guidance for a balanced integration, not visible labels.

PRESERVE ALL OTHER BASE-SCENE OBJECTS:
Keep the same warm taupe wall, pale wood floor and GOLDEN-BEIGE rug from Image 1.
Keep the left cream drawer cabinet, pleated cream lamp shade, rounded green lamp base, both blank product pouches at lower left, and the ONE small ribbed white bowl in its current spot.
Keep the yellow device at right with two blue-tipped antennae, three blue buttons and a dark unmarked opening; keep the separate cream-framed small blank dark display in front of it. This small floor display is a base-scene object and is distinct from the transferred main desktop monitor.
Keep the upright small white/orange/dark CALICO CAT at right in its current pose and position.
Keep the right cream cabinet, green vase and dark green leaf, four vertical pale books and horizontal green book, and large green plant/white pot at the far right.
Their positions, counts, silhouettes and materials must remain as close as possible to Image 1. The base-scene rug must not become red or patterned.

O11–O19 removed in the previous version must STAY ABSENT: no large purple/orange plush cat, turquoise-banded paws, reclining girl, toy rod/cord/fish, or magenta mascot. O10 is now also entirely absent.
No new people, floating text, labels, logos, music-note glyphs, extra furniture or extra props.

STYLE AND QUALITY:
One seamlessly composed warm 3D/product-render image, not a collage with pasted rectangles. Match perspective, diffuse warm light, softness and contact shadows across the imported pale wood desk, mesh/metal chair and existing room. Preserve the donor's wood/metal/mesh materials; do not turn office furniture into blue plush. Crisp coherent detail, clean edges, subtle rug fibers and believable object contact. No halos, ghosted blue support, warped legs, duplicated casters or disconnected chair parts.

OUTPUT:
One finished image, EXACT 1920 x 1080 pixels, Full HD landscape 16:9, no border.
```

## Archivos y exportación

- [Salida nativa, 1672 × 941](escena-limpia-nativa_v3.png).
- [Resultado Full HD, 1920 × 1080](escena-limpia-full-hd_v3.png).
- [Reporte de composición](reporte-v3-escritorio.md).
- [Inventario con procedencia](inventario-v3-escritorio.json).

La salida nativa se exportó con escalado uniforme Lanczos3 y ajuste central mínimo (`fit: cover`, `position: centre`). La composición creativa se realizó íntegramente con image_gen.
