# Escena pixel de /recursos: la tienda del aventurero

El hero de `/recursos` (`RecursosHero`) y el CTA final (`WorkshopCta`) muestran una escena pixel art
animada en bucle: el interior de una tienda medieval de aventureros y su taller de encargos. No es
un video: se dibuja en un `<canvas>` a resolución lógica baja (≈180 px de alto) y se escala con
`image-rendering: pixelated`.

- **Modo claro:** de día. Sol entrando por la ventana, nubes, motas de polvo en el haz.
- **Modo oscuro:** de noche. Luna y estrellas; la tienda la iluminan faroles, vela, caldero y los
  objetos mágicos, que brillan por encima de la oscuridad. Luciérnagas.
- **Cambio de tema:** fundido con tramado Bayer de ~420 ms.
- **Reduced motion:** un fotograma fijo e iluminado (`STILL_T`), sin bucle.

## Por qué canvas y no video

- El pixel art se emborrona con la compresión de video (submuestreo de croma).
- Día/noche × escritorio/móvil serían 4 videos de varios MB; esto son unos KB de código.
- La escena se recompone con el ancho (repisas y armería a los lados, mostrador y ventana al centro)
  en vez de recortarse.

## Bucle sin corte

Todo lo que se mueve es función pura de `t` (`loop.ts`) y completa un número **entero** de ciclos en
`LOOP` (12 s): `wave(t, k)`, `cycle(t, k)`, `wind(t)`, `flicker(t)`. El fotograma 288 es idéntico al 0. `wave`/`cycle` lanzan un error si `k` no es entero, y `loop.test.ts` lo comprueba. No hay azar por
fotograma: el "azar" sale de `hash(n)`, determinista.

## Archivos

| Archivo          | Qué es                                                                       |
| ---------------- | ---------------------------------------------------------------------------- |
| `loop.ts`        | Reloj: `LOOP`, `FPS` (24), ondas y ciclos con frecuencia entera, viento      |
| `draw.ts`        | Paleta, sprites (con capa emisiva), halos de luz con tramado, destello 8-bit |
| `sprites.ts`     | Mapas de píxeles de los objetos (`!` en la clave = luz propia)               |
| `room.ts`        | Cabaña común: pared de tablas, zócalo, suelo, viga y postes                  |
| `shop.ts`        | Escena de la tienda (hero)                                                   |
| `workshop.ts`    | Escena del taller (CTA)                                                      |
| `engine.ts`      | Tamaño, bucle a 24 fps, composición de luz, pausa, fundido día/noche         |
| `ShopCanvas.tsx` | Componente cliente: carga motor y escena en diferido y sigue el tema         |
| `loop.test.ts`   | Garantías del bucle (continuidad, rangos, determinismo)                      |

## Composición de un fotograma

```
materiales (base) → × mapa de luz (ambiente + halos tramados) → luz propia (emissive)
                  → bloom aditivo → partículas y destellos (overlay)
```

El mapa de luz **multiplica**: de noche la escena se oscurece de verdad y lo emisivo (llamas,
pociones, cristales, runas, cielo) se pinta después, sin apagarse. Lo que no se mueve se pre-renderiza
una vez por layout (`staticBase` / `staticEmit`).

## Rendimiento

- Motor y escena se cargan con `import()` tras hidratar; hasta entonces se ve un fondo CSS.
- 24 fps y sólo cuando el canvas está en pantalla y la pestaña visible (IntersectionObserver +
  `visibilitychange`).
- El tamaño de píxel sale del viewport (no del contenedor), así hero y CTA comparten grano.

## Añadir un objeto

1. Dibuja su mapa en `sprites.ts`; marca con `!` los tonos que emiten luz.
2. Colócalo en `layout()` de la escena (estático → a `items`; animado → en `base`/`emissive`).
3. Si da luz, añade un `Light` en `lights()`. Si destella, un `spark` con `k` entero.
4. `npm test`, `npm run typecheck`, `npm run lint`.
