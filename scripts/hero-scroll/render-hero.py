"""Renderiza el video del hero (scroll-scrub) a partir de una sola imagen.

Requisitos: Python 3, numpy, opencv-python y ffmpeg en el PATH.
Entrada:   src.png (escena 1920x1080) en el directorio actual.
Uso:       python3 render-hero.py desktop|mobile [day|night] [frames_de_preview...]
Salida:    mezz_<variante>[_night].mp4 (máster) y cam_<variante>[_night].json (cámara).

Ver src/features/home/hero-scroll/README.md para codificar los mp4/posters finales
y regenerar camera-data.ts.
"""
import sys, json, subprocess, math
import numpy as np, cv2

VARIANT = sys.argv[1]
ARGS = sys.argv[2:]
MODE = ARGS.pop(0) if ARGS and ARGS[0] in ('day', 'night') else 'day'
PREVIEW = [int(x) for x in ARGS]
SUFFIX = '' if MODE == 'day' else '_night'


SRC = cv2.cvtColor(cv2.imread('src.png'), cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
SH, SW = SRC.shape[:2]
# inner screen rect (source px)
SX0, SY0, SX1, SY1 = 698.0, 142.0, 1217.0, 380.0
FX, FY = (SX0 + SX1) / 2, (SY0 + SY1) / 2

N = 150
if VARIANT == 'desktop':
    OW, OH = 1920, 1080
else:
    OW, OH = 1080, 1920

# brand tokens
BRAND = np.array([79, 107, 255]) / 255
BRAND7 = np.array([44, 64, 189]) / 255
ACCENT = np.array([0, 212, 184]) / 255
VIOLET = np.array([124, 92, 255]) / 255
NIGHT = np.array([9, 12, 34]) / 255


def clamp01(x): return max(0.0, min(1.0, x))
def smooth(a, b, x):
    t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t)
def ease_io(a, b, x):
    t = clamp01((x - a) / (b - a))
    return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2
def lerp(a, b, t): return a + (b - a) * t

# ---------- precomputed light maps (source space) ----------
yy, xx = np.mgrid[0:SH, 0:SW].astype(np.float32)

def blurred_rect(x0, y0, x1, y1, sigma):
    m = np.zeros((SH, SW), np.float32)
    m[int(y0):int(y1), int(x0):int(x1)] = 1
    b = cv2.GaussianBlur(m, (0, 0), sigma)
    return b

spillL = blurred_rect(SX0, SY0, FX + 60, SY1, 170) + 0.35 * blurred_rect(SX0, SY0, FX, SY1, 70)
spillR = blurred_rect(FX - 60, SY0, SX1, SY1, 170) + 0.35 * blurred_rect(FX, SY0, SX1, SY1, 70)
norm = max(spillL.max(), spillR.max()); spillL /= norm; spillR /= norm
# keep spill off the monitor body itself
monitor = np.zeros((SH, SW), np.float32); monitor[136:387, 692:1223] = 1
monitor = cv2.GaussianBlur(monitor, (0, 0), 1.5)

# lamp
LX, LY = 205.0, 172.0
lampGlow = np.exp(-(((xx - LX) ** 2) / (2 * 150 ** 2) + ((yy - LY) ** 2) / (2 * 120 ** 2)))
lum = SRC.mean(2)
shade = np.zeros((SH, SW), np.float32)
box = (slice(115, 222), slice(135, 280))
shade[box] = (lum[box] > 0.80).astype(np.float32)
shade = cv2.GaussianBlur(shade, (0, 0), 1.2)
bulbHot = np.exp(-(((xx - LX) ** 2) / (2 * 40 ** 2) + ((yy - 205) ** 2) / (2 * 22 ** 2)))

WARM = np.array([1.0, 0.70, 0.42])


def relight(p):
    if MODE == 'night':
        return relight_night(p)
    E = lerp(1.0, 0.76, ease_io(0.10, 0.62, p))              # dusk exposure
    tint = lerp(np.ones(3), np.array([0.97, 0.98, 1.05]), smooth(0.1, 0.6, p))
    L = smooth(0.05, 0.20, p)                                  # lamp on
    B = smooth(0.36, 0.56, p)                                  # screen light
    flick = 1 + 0.12 * math.sin(p * 40) * smooth(0.40, 0.46, p) * (1 - smooth(0.46, 0.55, p))
    irr = np.ones((SH, SW, 3), np.float32) * (E * tint)
    irr += (L * 0.55) * lampGlow[..., None] * WARM
    s = B * flick * (1 - monitor)
    irr += (s * 0.70 * spillL)[..., None] * (0.04 + 0.96 * BRAND)
    irr += (s * 0.60 * spillR)[..., None] * (0.04 + 0.96 * ACCENT)
    out = SRC * irr
    # emissive shade
    em = (L * 0.75) * np.clip(shade + 0.6 * bulbHot, 0, 1)[..., None]
    out = out * (1 - em) + em * np.array([1.0, 0.93, 0.80])
    return np.clip(out, 0, 1)


def relight_night(p):
    """Night: room already dark and cool, lamp on from the first frame, screen lights the wall."""
    E = lerp(0.40, 0.33, smooth(0.05, 0.6, p))
    tint = np.array([0.80, 0.88, 1.14])
    L = 1.0
    B = smooth(0.36, 0.56, p)
    flick = 1 + 0.12 * math.sin(p * 40) * smooth(0.40, 0.46, p) * (1 - smooth(0.46, 0.55, p))
    irr = np.ones((SH, SW, 3), np.float32) * (E * tint)
    irr += (L * 0.95) * lampGlow[..., None] * WARM
    s = B * flick * (1 - monitor)
    irr += (s * 1.05 * spillL)[..., None] * (0.04 + 0.96 * BRAND)
    irr += (s * 0.90 * spillR)[..., None] * (0.04 + 0.96 * ACCENT)
    out = SRC * irr
    em = (L * 0.85) * np.clip(shade + 0.6 * bulbHot, 0, 1)[..., None]
    out = out * (1 - em) + em * np.array([1.0, 0.90, 0.74])
    return np.clip(out, 0, 1)


# ---------- camera ----------
def camera(p):
    """returns (x0, y0, win_w, win_h) crop window in source px"""
    if VARIANT == 'desktop':
        z = lerp(1.0, 1.03, smooth(0, 0.15, p))
        z = lerp(z, 2.78, ease_io(0.12, 0.80, p))
        z = lerp(z, 2.95, smooth(0.80, 1.0, p))
        ww, wh = SW / z, SH / z
        cx = FX + (SW / 2 - FX) / z
        cy = FY + (SH / 2 - FY) / z
        k = ease_io(0.50, 0.88, p)
        cx, cy = lerp(cx, FX, k), lerp(cy, FY + 10, k)
    else:
        z = lerp(1.0, 1.13, ease_io(0.38, 0.88, p))
        wh = SH / z; ww = wh * OW / OH
        startX = SW - ww / 2  # right edge: cat & shelf
        cx = lerp(startX, FX, ease_io(0.04, 0.50, p))
        cy = SH / 2
        cy = lerp(cy, FY, ease_io(0.38, 0.88, p))
    cx = min(max(cx, ww / 2), SW - ww / 2)
    cy = min(max(cy, wh / 2), SH - wh / 2)
    return cx - ww / 2, cy - wh / 2, ww, wh


# ---------- screen content ----------
def aurora(w, h, p, rng):
    v, u = np.mgrid[0:h, 0:w].astype(np.float32)
    u /= w; v /= h
    a = w / h
    col = np.ones((h, w, 3), np.float32) * NIGHT
    t = p * 2 * math.pi
    blobs = [
        (0.16 + 0.05 * math.sin(t * .9), 0.22 + 0.08 * math.cos(t * .7), 0.34, BRAND, 1.05),
        (0.86 - 0.05 * math.sin(t * .8), 0.84 - 0.06 * math.cos(t * .6), 0.36, ACCENT, 0.85),
        (0.52 + 0.08 * math.cos(t * .5), -0.05 + 0.05 * math.sin(t), 0.30, BRAND7, 0.9),
        (0.30 + 0.06 * math.sin(t * .6), 1.02, 0.26, VIOLET, 0.55),
    ]
    acc = np.zeros((h, w, 3), np.float32)
    for bx, by, r, c, I in blobs:
        d2 = ((u - bx) * a) ** 2 + (v - by) ** 2
        g = np.exp(-d2 / (2 * (r * 0.75) ** 2))
        acc += g[..., None] * c * I
    col = col + (1 - np.exp(-acc * 1.45))  # soft tone-map
    # dot grid
    step = max(10, int(round(w / 64)))
    dots = ((np.mod(u * w, step) < 1.4) & (np.mod(v * h, step) < 1.4)).astype(np.float32)
    col += dots[..., None] * 0.045
    # glass gloss top-left
    gloss = np.clip(1 - (u * 0.7 + v * 1.3), 0, 1) ** 2 * 0.06
    col += gloss[..., None]
    # inner vignette
    vig = 1 - 0.35 * (((u - .5) * 2) ** 2 * 0.5 + ((v - .5) * 2) ** 2 * 0.6)
    col *= np.clip(vig, 0.55, 1)[..., None]
    col += rng.normal(0, 1.2 / 255, col.shape).astype(np.float32)  # dither vs banding
    return np.clip(col, 0, 1)


def composite_screen(frame, p, x0, y0, s):
    q = smooth(0.34, 0.54, p)
    if q <= 0: return frame
    X0, Y0 = (SX0 - x0) * s, (SY0 - y0) * s
    X1, Y1 = (SX1 - x0) * s, (SY1 - y0) * s
    ix0, iy0 = int(math.floor(X0)), int(math.floor(Y0))
    ix1, iy1 = int(math.ceil(X1)), int(math.ceil(Y1))
    ix0c, iy0c = max(ix0, 0), max(iy0, 0)
    ix1c, iy1c = min(ix1, OW), min(iy1, OH)
    if ix1c <= ix0c or iy1c <= iy0c: return frame
    w, h = ix1 - ix0, iy1 - iy0
    rng = np.random.default_rng(7)
    content = aurora(w, h, p, rng)
    # radial reveal
    v, u = np.mgrid[0:h, 0:w].astype(np.float32)
    du, dv = (u / w - .5) * 2, (v / h - .5) * 2
    d = np.sqrt(du ** 2 * 0.8 + dv ** 2 * 0.8)
    R = lerp(-0.2, 1.6, ease_io(0, 1, q))
    reveal = np.clip((R - d) / 0.35, 0, 1)
    flash = 0.22 * math.exp(-((q - 0.35) / 0.12) ** 2)
    content = np.clip(content + flash, 0, 1)
    # subpixel-accurate rect mask with soft edges
    mx = np.clip(np.minimum(u + ix0 + 0.5 - X0, X1 - (u + ix0 + 0.5)) + 0.5, 0, 1)
    my = np.clip(np.minimum(v + iy0 + 0.5 - Y0, Y1 - (v + iy0 + 0.5)) + 0.5, 0, 1)
    alpha = (mx * my * reveal)[..., None]
    sl = (slice(iy0c - iy0, iy1c - iy0), slice(ix0c - ix0, ix1c - ix0))
    region = frame[iy0c:iy1c, ix0c:ix1c]
    frame[iy0c:iy1c, ix0c:ix1c] = region * (1 - alpha[sl]) + content[sl] * alpha[sl]
    # bloom: glow layer built only from the screen content, so it fades to 0 smoothly
    sig = 10 * s
    pad = int(4 * sig)
    by0, by1 = max(iy0c - pad, 0), min(iy1c + pad, OH)
    bx0, bx1 = max(ix0c - pad, 0), min(ix1c + pad, OW)
    layer = np.zeros((by1 - by0, bx1 - bx0, 3), np.float32)
    layer[iy0c - by0:iy1c - by0, ix0c - bx0:ix1c - bx0] = content[sl] * alpha[sl]
    bloom = cv2.GaussianBlur(layer, (0, 0), sig)
    frame[by0:by1, bx0:bx1] = np.clip(frame[by0:by1, bx0:bx1] + bloom * 0.35 * q, 0, 1)
    return frame


cams = []
ff = None
if not PREVIEW:
    ff = subprocess.Popen(['ffmpeg', '-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24',
                           '-s', f'{OW}x{OH}', '-r', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'slow',
                           '-crf', '10', '-pix_fmt', 'yuv420p', f'mezz_{VARIANT}{SUFFIX}.mp4'], stdin=subprocess.PIPE)
frames = PREVIEW or range(N)
for i in frames:
    p = i / (N - 1)
    img = relight(p)
    x0, y0, ww, wh = camera(p)
    s = OW / ww
    M = np.array([[s, 0, -x0 * s], [0, s, -y0 * s]], np.float32)
    fr = cv2.warpAffine(img, M, (OW, OH), flags=cv2.INTER_LANCZOS4, borderMode=cv2.BORDER_REFLECT)
    fr = np.clip(fr, 0, 1)
    fr = composite_screen(fr, p, x0, y0, s)
    out8 = (np.clip(fr, 0, 1) * 255 + 0.5).astype(np.uint8)
    cams.append([round(x0, 2), round(y0, 2), round(s, 5)])
    if PREVIEW:
        cv2.imwrite(f'prev_{VARIANT}{SUFFIX}_{i:03d}.jpg', cv2.cvtColor(out8, cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 88])
    else:
        ff.stdin.write(out8.tobytes())
        if i % 25 == 0: print(VARIANT, i, flush=True)
if ff:
    ff.stdin.close(); ff.wait()
    json.dump({'w': OW, 'h': OH, 'fps': 30, 'frames': N,
               'screen': [SX0, SY0, SX1, SY1], 'cam': cams}, open(f'cam_{VARIANT}{SUFFIX}.json', 'w'))
