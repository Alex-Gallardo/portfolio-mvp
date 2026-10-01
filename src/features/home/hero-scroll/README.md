# Hero del Home: video controlado por scroll

El hero (`components/HeroHome`) muestra una escena de escritorio. Al hacer scroll la cámara se
acerca al monitor, que se enciende con la aurora de marca, y el H1 vive dentro de la pantalla.

- **Modo claro:** la escena atardece y se enciende la lámpara (`*-day`).
- **Modo oscuro:** ya es de noche y la lámpara está encendida desde el inicio (`*-night`).
- **Reduced motion:** hero estático con el poster, scrim y texto centrado (sin video).

## Archivos

| Archivo                                                       | Qué es                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `public/hero/scroll/desktop-{day,night}-{1080p,720p}.mp4`     | Video 16:9, 150 frames a 30 fps                                    |
| `public/hero/scroll/mobile-{day,night}.mp4`                   | Video 9:16 (720×1280), 150 frames                                  |
| `public/hero/scroll/poster-{desktop,mobile}-{day,night}.webp` | Frame 0, candidato a LCP                                           |
| `camera-data.ts`                                              | Cámara por frame; la misma para día y noche                        |
| `screen-rect.ts`                                              | Funciones puras: rect del monitor en el viewport, progreso, frames |
| `hero-media.ts`                                               | Rutas de los assets y elección de video por orientación/tema/DPR   |

El video se descarga completo (blob) después del evento `load`, para que cada seek sea instantáneo
y no compita con el LCP. Solo se descarga el que corresponde a la orientación y al tema activos.

## Regenerar el video

1. Copia la escena original como `src.png` (1920×1080) en una carpeta de trabajo.
2. Renderiza los cuatro másters:
   ```bash
   python3 scripts/hero-scroll/render-hero.py desktop day
   python3 scripts/hero-scroll/render-hero.py desktop night
   python3 scripts/hero-scroll/render-hero.py mobile day
   python3 scripts/hero-scroll/render-hero.py mobile night
   ```
3. Codifica con un keyframe cada 5 frames y sin B-frames (seek rápido):
   ```bash
   enc() { ffmpeg -y -i "$1" -vf "scale=$2:flags=lanczos" -c:v libx264 -preset slow \
     -profile:v high -crf 23 -g 5 -keyint_min 5 -bf 0 -sc_threshold 0 \
     -pix_fmt yuv420p -movflags +faststart -an "$3"; }
   enc mezz_desktop.mp4 1920:1080 desktop-day-1080p.mp4
   enc mezz_desktop.mp4 1280:720  desktop-day-720p.mp4
   enc mezz_mobile.mp4  720:1280  mobile-day.mp4
   # …y lo mismo con mezz_*_night.mp4 → *-night*.mp4
   ffmpeg -i mezz_desktop.mp4 -frames:v 1 -c:v libwebp -quality 80 poster-desktop-day.webp
   ffmpeg -i mezz_mobile.mp4 -frames:v 1 -vf scale=720:1280 -c:v libwebp -quality 80 poster-mobile-day.webp
   ```
4. Si cambiaste la cámara, regenera `camera-data.ts` desde `cam_desktop.json` y `cam_mobile.json`
   y actualiza las constantes del frame 0 (`--x0`, `--y0`, `--s0`) en `HeroHome.module.css`.
5. Ejecuta `npm test`, `npm run typecheck`, `npm run lint` y `npm run build`.
