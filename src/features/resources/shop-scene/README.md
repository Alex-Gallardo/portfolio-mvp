# Escena pixel de /recursos: la tienda del aventurero

El hero de `/recursos` (`RecursosHero`, 95% del alto de pantalla) y el CTA final (`WorkshopCta`)
muestran una escena pixel art animada en bucle: el interior de una tienda medieval de aventureros y
su taller de encargos. No es un video: se dibuja en un `<canvas>` a resolución lógica baja (≈240 px
de alto en horizontal, ≈340 en vertical) y se escala con `image-rendering: pixelated`.

El título y los filtros no van sobre la escena: viven en el letrero de debajo (`RecursosIntro`), que
se monta sobre el borde inferior del hero. Un indicador pixel ("Entra a la tienda") invita a bajar y
se desvanece con el scroll (`animation-timeline: scroll()`).

- **Modo claro:** de día. Sol, nubes y colinas en el ventanal; haz de sol con motas de polvo.
- **Modo oscuro:** de noche. Luna creciente, montañas, estrellas y una estrella fugaz por bucle; la
  tienda la iluminan la lámpara de campanas, faroles, apliques, velas, caldero y los objetos mágicos.
  Luciérnagas.
- **Cambio de tema:** fundido con tramado Bayer de ~420 ms.
- **Reduced motion:** un fotograma fijo e iluminado (`STILL_T`), sin bucle.

## Por qué canvas y no video

- El pixel art se emborrona con la compresión de video (submuestreo de croma).
- Día/noche × escritorio/móvil serían 4 videos de varios MB; esto son unos KB de código.
- La escena se recompone con el ancho (estanterías y paredes a los lados, ventanal y mostrador al
  centro) en vez de recortarse.

## Bucle sin corte

Todo lo que se mueve es función pura de `t` (`loop.ts`) y completa un número **entero** de ciclos en
`LOOP` (12 s): `wave(t, k)`, `cycle(t, k)`, `wind(t)`, `flicker(t)`. El fotograma 288 es idéntico al 0. `wave`/`cycle` lanzan un error si `k` no es entero, y `loop.test.ts` lo comprueba. No hay azar por
fotograma: el "azar" sale de `hash(n)`, determinista.

## Archivos

| Archivo               | Qué es                                                                  |
| --------------------- | ----------------------------------------------------------------------- |
| `loop.ts`             | Reloj: `LOOP`, `FPS` (24), ondas y ciclos con frecuencia entera, viento |
| `draw.ts`             | Paleta, sprites (capa emisiva), cizalla, halos con tramado, destello    |
| `sprites/`            | Mapas de píxeles: `items`, `decor` (gato, plantas…), `workshop`         |
| `room.ts`             | Cabaña común: techo, viga, muro de piedra, zócalo, baldosas             |
| `shop-layout.ts`      | Plano puro de la tienda: dónde va cada mueble según el tamaño           |
| `shop.ts`             | Escena de la tienda (hero)                                              |
| `workshop.ts`         | Escena del taller (CTA)                                                 |
| `engine.ts`           | Tamaño, bucle a 24 fps, composición de luz, pausa, fundido día/noche    |
| `ShopCanvas.tsx`      | Componente cliente: carga motor y escena en diferido y sigue el tema    |
| `loop.test.ts`        | Garantías del bucle (continuidad, rangos, determinismo)                 |
| `shop-layout.test.ts` | Nada se pisa ni se sale en escritorio, tablet y móvil                   |

## Composición de un fotograma

```
materiales (base) → × mapa de luz (ambiente + halos tramados + haz del ventanal)
                  → luz propia (emissive: cielo, llamas, pociones, gemas, runas)
                  → bloom aditivo → cristal de la vitrina, partículas y destellos (overlay)
```

El mapa de luz **multiplica**: de noche la escena se oscurece de verdad y lo emisivo se pinta
después, sin apagarse. Lo que no se mueve se pre-renderiza una vez por layout
(`staticBase` / `staticEmit`); el cielo se pre-renderiza por modo y se recorta con una máscara del
arco.

## Rendimiento

- Motor y escena se cargan con `import()` tras hidratar; hasta entonces se ve un fondo CSS.
- 24 fps y sólo cuando el canvas está en pantalla y la pestaña visible (IntersectionObserver +
  `visibilitychange`).
- El tamaño de píxel sale del viewport (no del contenedor), así hero y CTA comparten grano.

## Añadir un objeto

1. Dibuja su mapa en `sprites/`; marca con `!` los tonos que emiten luz y usa tonos fuera de
   paleta (`liquid`, `gem`…) para teñirlo al usarlo.
2. Si ocupa sitio propio, reserva su hueco en `shop-layout.ts` y añade el caso al test.
3. Colócalo en `layout()` de la escena (estático → a `items`; animado → en `base`/`emissive`).
4. Si da luz, añade un `Light` en `lights()`. Si destella, un `spark` con `k` entero.
5. `npm test`, `npm run typecheck`, `npm run lint`.
