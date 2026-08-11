# Experiencia Diseño 3D

La ruta `/design` usa dos secuencias con la misma cantidad y orden narrativo:

- `public/design/sequence/desktop/frame-01.webp ...`
- `public/design/sequence/mobile/frame-01.webp ...`

El motor dibuja el par de frames más cercano al progreso del scroll e interpola su opacidad. La
cache conserva un máximo de 14 imágenes decodificadas para que una futura secuencia extensa no
permanezca completa en memoria.

## Sustituir por una secuencia de 64 frames

1. Exportar las dos orientaciones con exactamente 64 imágenes y sin números faltantes.
2. Mantener dimensiones, cámara, exposición y perfil sRGB constantes dentro de cada orientación.
3. Nombrar los archivos `frame-01.webp` a `frame-64.webp`.
4. Cambiar `DESIGN_FRAME_COUNT` a `64` en `design-content.ts`.
5. Ejecutar `npm test`, `npm run typecheck`, `npm run lint` y `npm run build`.

No es necesario modificar el componente del canvas. El primer frame funciona como poster y debe
ser el más liviano; cada imagen debe permanecer por debajo de 200 KB.

## Dirección de las imágenes originales

Los cinco actos actuales fueron generados con ChatGPT Image a partir de esta dirección compartida:

> Escena CGI 3D contemporánea y cinematográfica en un vacío obsidiana. Una semilla geométrica de
> cerámica perlada y líneas cobalto transforma gradualmente una idea en personaje, producto,
> materiales y arquitectura. Cámara fija, render físicamente basado, iluminación volumétrica
> contenida, espacio negativo para copy, sin texto, logos, marcas ni watermark.

Cada acto conserva cámara, horizonte, suelo reflectante, paleta y objetos del anterior. Las variantes
móviles son recomposiciones verticales 9:16, no recortes automáticos de los frames horizontales.
