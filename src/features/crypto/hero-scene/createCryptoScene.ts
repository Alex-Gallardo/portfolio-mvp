import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

import { CAMERA, computeLayout, toWorld, type Rect, type SceneObject } from "./layout";
import {
  createCoinEdgeTexture,
  createCoinFaceTextures,
  createGlowTexture,
  createStarTexture,
} from "./textures";

/**
 * Escena three.js del hero /crypto.
 *
 * Objetos (de fuera hacia dentro):
 *   anchor  → posición/escala según el layout (px → mundo)
 *   float   → flotación suave + halo + destellos (no giran)
 *   spin    → rotación propia del objeto
 *
 * Todo vive en un `root` que se inclina con el puntero (parallax).
 * Se carga con import() dinámico desde CryptoScene.tsx para no tocar el LCP.
 */

export type SceneTheme = "light" | "dark";

export interface CryptoSceneOptions {
  canvas: HTMLCanvasElement;
  theme: SceneTheme;
  reducedMotion: boolean;
  onFirstFrame?: () => void;
}

export interface CryptoSceneHandle {
  /** Tamaño del hero en px y caja del bloque de texto (relativa al hero). */
  layout(width: number, height: number, text: Rect): void;
  setTheme(theme: SceneTheme): void;
  /** Puntero normalizado: -1 (izq/abajo) … 1 (der/arriba). */
  setPointer(x: number, y: number): void;
  /** Pausa el bucle cuando el hero no está en pantalla. */
  setActive(active: boolean): void;
  dispose(): void;
}

const THEMES = {
  dark: {
    exposure: 1.05,
    edge: "#43f3dc",
    edgeBase: 0.5,
    glass: "#0b1a29",
    glassOpacity: 0.55,
    coreDim: "#0b6b60",
    coreBright: "#7dffe9",
    link: "#cfd8ea",
    ring: "#43f3dc",
    glow: 0.85,
    glint: 1,
    sparkleOpacity: 1,
    sparkles: ["#ffffff", "#5ff5df", "#8d9dff", "#ffd36e"],
  },
  light: {
    exposure: 1,
    edge: "#00a08b",
    edgeBase: 0.55,
    glass: "#f1fffc",
    glassOpacity: 0.62,
    coreDim: "#7fd9cc",
    coreBright: "#00b39b",
    link: "#8893aa",
    ring: "#00a08b",
    glow: 0.5,
    glint: 0.9,
    sparkleOpacity: 0.85,
    sparkles: ["#00a893", "#4f6bff", "#e0a019", "#00c2a8"],
  },
} as const;

const GOLD = "#ffbf3c";
const ETH = "#4f66dc"; // azul Ethereum, un punto más profundo para dar volumen
const ACCENT = "#00d4b8";
const INDIGO = "#5b74ff";

const easeOutBack = (t: number) => {
  const c1 = 1.4;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Pulso afilado 0…1 con periodo 2π. */
const spike = (x: number, sharpness = 6) => Math.pow(Math.max(0, Math.sin(x)), sharpness);

// ──────────────────────────────────────────────────────────────
// Geometrías
// ──────────────────────────────────────────────────────────────

/**
 * Dos pirámides de base cuadrada unidas por la base (en `ringY`).
 * - Apex superior por encima de la base → bipirámide (cristal del logo de Ethereum).
 * - Apex superior por debajo de la base → cara superior hundida (el "chevron").
 */
function pyramidPairGeometry(ringY: number, upperApexY: number, lowerApexY: number, r: number) {
  const corner = (i: number) => {
    const t = (i % 4) * (Math.PI / 2);
    return [Math.round(Math.cos(t)) * r, ringY, Math.round(Math.sin(t)) * r];
  };
  const upper = [0, upperApexY, 0];
  const lower = [0, lowerApexY, 0];
  const pos: number[] = [];
  for (let i = 0; i < 4; i++) {
    const a = corner(i);
    const b = corner(i + 1);
    pos.push(...upper, ...b, ...a); // normal hacia fuera (arriba)
    pos.push(...lower, ...a, ...b); // normal hacia fuera (abajo)
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  geo.computeVertexNormals();
  return geo;
}

// ──────────────────────────────────────────────────────────────
// Destellos (Points con shader: parpadeo + estrella de 4 puntas)
// ──────────────────────────────────────────────────────────────

const SPARKLE_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aScale;
  attribute vec3 aColor;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.y += sin(uTime * 0.35 * aSpeed + aPhase) * 0.18;
    p.x += cos(uTime * 0.25 * aSpeed + aPhase) * 0.08;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float tw = 0.5 + 0.5 * sin(uTime * aSpeed + aPhase);
    vAlpha = 0.12 + 0.88 * pow(tw, 5.0);
    vColor = aColor;
    gl_PointSize = uSize * aScale * uPixelRatio * (0.55 + 0.75 * tw) * (14.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const SPARKLE_FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    float core = pow(smoothstep(0.5, 0.0, d), 3.0);
    float rayX = smoothstep(0.05, 0.0, abs(uv.y)) * smoothstep(0.5, 0.0, abs(uv.x));
    float rayY = smoothstep(0.05, 0.0, abs(uv.x)) * smoothstep(0.5, 0.0, abs(uv.y));
    float a = clamp(core + max(rayX, rayY) * 0.7, 0.0, 1.0) * vAlpha * uOpacity;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a);
    #include <colorspace_fragment>
  }
`;

// ──────────────────────────────────────────────────────────────

export function createCryptoScene(options: CryptoSceneOptions): CryptoSceneHandle | null {
  const { canvas, reducedMotion, onFirstFrame } = options;
  let theme: SceneTheme = options.theme;

  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
  } catch {
    return null; // sin WebGL: el hero sigue completo con sus capas CSS
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(CAMERA.fov, 1, 0.1, 100);
  camera.position.set(0, 0, CAMERA.distance);

  // Reflejos metálicos sin HDR externo
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTexture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTexture;

  scene.add(new THREE.HemisphereLight(0xffffff, 0x223344, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(4, 6, 8);
  const rimTeal = new THREE.DirectionalLight(ACCENT, 2.4);
  rimTeal.position.set(-8, -3, 2);
  const rimIndigo = new THREE.DirectionalLight(INDIGO, 2.6);
  rimIndigo.position.set(8, 4, -2);
  scene.add(key, rimTeal, rimIndigo);

  const root = new THREE.Group();
  scene.add(root);

  // ---- recursos compartidos ----
  const textures: THREE.Texture[] = [];
  const glowTex = createGlowTexture();
  const starTex = createStarTexture();
  const face = createCoinFaceTextures();
  const edgeTex = createCoinEdgeTexture();
  textures.push(glowTex, starTex, face.map, face.bumpMap, edgeTex);

  const glowSprites: { sprite: THREE.Sprite; base: number; phase: number }[] = [];
  const glints: { sprite: THREE.Sprite; base: number; phase: number; speed: number }[] = [];

  function addGlow(parent: THREE.Object3D, color: string, size: number, z = -0.6) {
    const mat = new THREE.SpriteMaterial({
      map: glowTex,
      color,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.setScalar(size);
    sprite.position.z = z;
    sprite.renderOrder = -1;
    parent.add(sprite);
    glowSprites.push({ sprite, base: size, phase: Math.random() * Math.PI * 2 });
  }

  function addGlint(parent: THREE.Object3D, x: number, y: number, z: number, size: number) {
    const mat = new THREE.SpriteMaterial({
      map: starTex,
      color: 0xffffff,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(mat);
    sprite.position.set(x, y, z);
    sprite.scale.setScalar(size);
    sprite.renderOrder = 10;
    parent.add(sprite);
    glints.push({
      sprite,
      base: size,
      phase: Math.random() * 10,
      speed: 0.6 + Math.random() * 0.5,
    });
  }

  interface Floating {
    anchor: THREE.Group;
    float: THREE.Group;
    spin: THREE.Group;
    phase: number;
    intro: number; // retraso de la entrada (s)
    scale: number; // escala del layout
  }

  function makeFloating(intro: number): Floating {
    const anchor = new THREE.Group();
    const float = new THREE.Group();
    const spin = new THREE.Group();
    anchor.add(float);
    float.add(spin);
    root.add(anchor);
    return { anchor, float, spin, phase: Math.random() * Math.PI * 2, intro, scale: 1 };
  }

  // ---- Moneda Bitcoin ----
  const coinFaceGeo = new THREE.CircleGeometry(1, 96);
  const coinEdgeGeo = new THREE.CylinderGeometry(1, 1, 0.17, 96, 1, true);
  coinEdgeGeo.rotateX(Math.PI / 2);
  const coinFaceMat = new THREE.MeshStandardMaterial({
    map: face.map,
    bumpMap: face.bumpMap,
    bumpScale: 3,
    metalness: 0.92,
    roughness: 0.26,
    envMapIntensity: 1.35,
  });
  const coinEdgeMat = new THREE.MeshStandardMaterial({
    map: edgeTex,
    color: "#ffd27a",
    metalness: 1,
    roughness: 0.32,
    envMapIntensity: 1.2,
  });

  function buildCoin(target: THREE.Group) {
    const front = new THREE.Mesh(coinFaceGeo, coinFaceMat);
    front.position.z = 0.085;
    const back = new THREE.Mesh(coinFaceGeo, coinFaceMat);
    back.position.z = -0.085;
    back.rotation.y = Math.PI;
    target.add(front, back, new THREE.Mesh(coinEdgeGeo, coinEdgeMat));
  }

  const coin = makeFloating(0.1);
  buildCoin(coin.spin);
  addGlow(coin.float, GOLD, 5.6);
  addGlint(coin.float, 0.72, 0.72, 0.4, 0.9);
  addGlint(coin.float, -0.8, -0.5, 0.4, 0.55);

  // Órbita con nodos alrededor de la moneda: "red"
  const ORBIT = 1.32;
  const orbit = new THREE.Group();
  orbit.rotation.set(1.18, 0.25, 0.35);
  coin.float.add(orbit);
  const ringMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.45 });
  const ringGeo = new THREE.TorusGeometry(ORBIT, 0.008, 6, 160);
  orbit.add(new THREE.Mesh(ringGeo, ringMat));
  const nodeGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const nodeMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
  const orbitNodes = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map(() => {
    const node = new THREE.Mesh(nodeGeo, nodeMat);
    orbit.add(node);
    return node;
  });

  const coinSmall = makeFloating(0.45);
  buildCoin(coinSmall.spin);
  addGlow(coinSmall.float, GOLD, 5);
  addGlint(coinSmall.float, 0.7, 0.6, 0.4, 0.8);

  // ---- Cristal de Ethereum ----
  const ethTopGeo = pyramidPairGeometry(0, 1.5, -0.62, 0.9);
  const ethBottomGeo = pyramidPairGeometry(-0.36, -0.98, -1.62, 0.9);
  const ethTopMat = new THREE.MeshPhysicalMaterial({
    color: "#7488ff",
    metalness: 0.12,
    roughness: 0.22,
    flatShading: true,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 0.55,
    iridescenceIOR: 1.6,
    iridescenceThicknessRange: [200, 800],
    envMapIntensity: 0.85,
  });
  const ethBottomMat = ethTopMat.clone();
  ethBottomMat.color.set(ETH);
  const ethEdgeMat = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 });

  const eth = makeFloating(0.25);
  const ethBody = new THREE.Group();
  ethBody.scale.setScalar(0.8);
  ethBody.position.y = 0.05;
  ethBody.add(
    new THREE.Mesh(ethTopGeo, ethTopMat),
    new THREE.Mesh(ethBottomGeo, ethBottomMat),
    new THREE.LineSegments(new THREE.EdgesGeometry(ethTopGeo), ethEdgeMat),
    new THREE.LineSegments(new THREE.EdgesGeometry(ethBottomGeo), ethEdgeMat),
  );
  eth.spin.add(ethBody);
  addGlow(eth.float, INDIGO, 6);
  addGlow(eth.float, ACCENT, 3.4, -0.4);
  addGlint(eth.float, 0, 1.3, 0.3, 1);
  addGlint(eth.float, 0.55, -0.4, 0.5, 0.5);

  // ---- Cadena de bloques ----
  const chain = makeFloating(0.4);
  const BLOCKS = 4;
  const BLOCK = 0.62;
  const GAP = 0.95;
  const boxGeo = new THREE.BoxGeometry(BLOCK, BLOCK, BLOCK);
  const boxEdgesGeo = new THREE.EdgesGeometry(boxGeo);
  const coreGeo = new THREE.BoxGeometry(BLOCK * 0.36, BLOCK * 0.36, BLOCK * 0.36);
  const linkGeo = new THREE.TorusGeometry(0.11, 0.03, 12, 32);
  const glassMat = new THREE.MeshPhysicalMaterial({
    metalness: 0.1,
    roughness: 0.12,
    clearcoat: 1,
    transparent: true,
    envMapIntensity: 1.1,
  });
  const linkMat = new THREE.MeshStandardMaterial({ metalness: 1, roughness: 0.25 });
  /** Centro del bloque i dentro de la cadena (ligero arco en Y/Z). */
  const blockAt = (i: number, target = new THREE.Vector3()) =>
    target.set((i - (BLOCKS - 1) / 2) * GAP, Math.sin(i * 1.1) * 0.16, Math.cos(i * 0.9) * 0.18);
  const blocks: {
    edgeMat: THREE.LineBasicMaterial;
    coreMat: THREE.MeshBasicMaterial;
    core: THREE.Mesh;
  }[] = [];

  for (let i = 0; i < BLOCKS; i++) {
    const g = new THREE.Group();
    const pos = blockAt(i);
    g.position.copy(pos);
    g.rotation.set(0.35, 0.6 + i * 0.12, 0.08);

    const edgeMat = new THREE.LineBasicMaterial({ transparent: true });
    const coreMat = new THREE.MeshBasicMaterial();
    const core = new THREE.Mesh(coreGeo, coreMat);
    g.add(core, new THREE.Mesh(boxGeo, glassMat), new THREE.LineSegments(boxEdgesGeo, edgeMat));
    chain.spin.add(g);
    blocks.push({ edgeMat, coreMat, core });

    if (i > 0) {
      // dos eslabones entrelazados entre bloques
      const mid = blockAt(i - 1)
        .add(pos)
        .multiplyScalar(0.5);
      const a = new THREE.Mesh(linkGeo, linkMat);
      a.position.copy(mid).add(new THREE.Vector3(-0.08, 0, 0));
      a.rotation.y = Math.PI / 2;
      a.rotation.z = Math.PI / 2;
      const b = new THREE.Mesh(linkGeo, linkMat);
      b.position.copy(mid).add(new THREE.Vector3(0.08, 0, 0));
      chain.spin.add(a, b);
    }
  }
  addGlow(chain.float, ACCENT, 5.4);

  // Paquete de luz que recorre la cadena (la transacción que se confirma)
  const packet = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: starTex,
      color: "#ffffff",
      transparent: true,
      depthWrite: false,
    }),
  );
  packet.scale.setScalar(0.55);
  packet.renderOrder = 5;
  chain.spin.add(packet);

  const objects: Record<SceneObject, Floating> = { coin, eth, chain, coinSmall };

  // ---- Destellos ----
  const SPARKLES = typeof window !== "undefined" && window.innerWidth < 768 ? 70 : 150;
  const sparkleGeo = new THREE.BufferGeometry();
  const sPos = new Float32Array(SPARKLES * 3);
  const sPhase = new Float32Array(SPARKLES);
  const sSpeed = new Float32Array(SPARKLES);
  const sScale = new Float32Array(SPARKLES);
  const sColor = new Float32Array(SPARKLES * 3);
  for (let i = 0; i < SPARKLES; i++) {
    let x = 0;
    let y = 0;
    // pocos destellos detrás del texto para no ensuciar la lectura
    do {
      x = (Math.random() * 2 - 1) * 1.1;
      y = (Math.random() * 2 - 1) * 1.05;
    } while (Math.abs(x) < 0.42 && Math.abs(y) < 0.4 && Math.random() < 0.85);
    sPos[i * 3] = x;
    sPos[i * 3 + 1] = y;
    sPos[i * 3 + 2] = -5 + Math.random() * 7;
    sPhase[i] = Math.random() * Math.PI * 2;
    sSpeed[i] = 0.6 + Math.random() * 1.6;
    sScale[i] = 0.5 + Math.pow(Math.random(), 3) * 1.6;
  }
  sparkleGeo.setAttribute("position", new THREE.BufferAttribute(sPos, 3));
  sparkleGeo.setAttribute("aPhase", new THREE.BufferAttribute(sPhase, 1));
  sparkleGeo.setAttribute("aSpeed", new THREE.BufferAttribute(sSpeed, 1));
  sparkleGeo.setAttribute("aScale", new THREE.BufferAttribute(sScale, 1));
  const colorAttr = new THREE.BufferAttribute(sColor, 3);
  sparkleGeo.setAttribute("aColor", colorAttr);

  const sparkleUniforms = {
    uTime: { value: 0 },
    uPixelRatio: { value: 1 },
    uSize: { value: 9 },
    uOpacity: { value: 1 },
  };
  const sparkleMat = new THREE.ShaderMaterial({
    vertexShader: SPARKLE_VERTEX,
    fragmentShader: SPARKLE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    uniforms: sparkleUniforms,
  });
  const sparkles = new THREE.Points(sparkleGeo, sparkleMat);
  sparkles.frustumCulled = false;
  scene.add(sparkles); // fuera de `root`: el parallax no los arrastra

  // ──────────────────────────────────────────────────────────────
  // Tema
  // ──────────────────────────────────────────────────────────────
  let glowOpacity = 0;
  let glintOpacity = 0;
  let edgeBase = 0.5;
  const coreDim = new THREE.Color();
  const coreBright = new THREE.Color();

  function applyTheme(next: SceneTheme) {
    theme = next;
    const t = THEMES[next];
    renderer.toneMappingExposure = t.exposure;
    ethEdgeMat.color.set(t.edge);
    ringMat.color.set(t.ring);
    glassMat.color.set(t.glass);
    glassMat.opacity = t.glassOpacity;
    linkMat.color.set(t.link);
    for (const b of blocks) b.edgeMat.color.set(t.edge);
    coreDim.set(t.coreDim);
    coreBright.set(t.coreBright);
    edgeBase = t.edgeBase;
    glowOpacity = t.glow;
    glintOpacity = t.glint;
    sparkleUniforms.uOpacity.value = t.sparkleOpacity;
    (packet.material as THREE.SpriteMaterial).color.set(next === "dark" ? "#ffffff" : t.edge);
    for (const g of glints) g.sprite.material.color.set(next === "dark" ? "#ffffff" : "#fff3c4");

    const palette = t.sparkles.map((c) => new THREE.Color(c));
    for (let i = 0; i < SPARKLES; i++) {
      const c = palette[i % palette.length];
      if (!c) continue;
      sColor[i * 3] = c.r;
      sColor[i * 3 + 1] = c.g;
      sColor[i * 3 + 2] = c.b;
    }
    colorAttr.needsUpdate = true;
  }
  applyTheme(theme);

  // ──────────────────────────────────────────────────────────────
  // Estado de la animación
  // ──────────────────────────────────────────────────────────────
  const pointer = new THREE.Vector2();
  const from = new THREE.Vector3();
  const to = new THREE.Vector3();
  const tilt = new THREE.Vector2();
  let elapsed = reducedMotion ? 4 : 0;
  let last = 0;
  /** Momento (ms) del primer fotograma animado: la entrada usa tiempo real, no `elapsed`. */
  let startedAt = 0;
  let introT = reducedMotion ? 10 : 0;
  let running = false;
  let firstFrame = true;

  // ──────────────────────────────────────────────────────────────
  // Layout / tamaño
  // ──────────────────────────────────────────────────────────────
  function layout(w: number, h: number, text: Rect) {
    if (w < 2 || h < 2) return;
    const dpr = Math.min(window.devicePixelRatio || 1, w < 768 ? 1.5 : 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    sparkleUniforms.uPixelRatio.value = dpr;
    sparkleUniforms.uSize.value = h < 700 ? 7 : 9;

    const placements = computeLayout(w, h, text);
    for (const name of Object.keys(objects) as SceneObject[]) {
      const p = toWorld(name, placements[name], w, h);
      objects[name].anchor.position.set(p.x, p.y, p.z);
      objects[name].scale = p.scale;
    }

    // destellos repartidos por todo el encuadre
    const halfH = Math.tan(((CAMERA.fov / 2) * Math.PI) / 180) * CAMERA.distance;
    sparkles.scale.set(halfH * camera.aspect, halfH, 1);

    if (!running) render(elapsed);
  }

  // ──────────────────────────────────────────────────────────────
  // Animación
  // ──────────────────────────────────────────────────────────────
  function update(t: number) {
    for (const o of Object.values(objects)) {
      const k = Math.min(1, Math.max(0, (introT - o.intro) / 1.3));
      o.anchor.scale.setScalar(o.scale * Math.max(0.0001, easeOutBack(k)));
      o.float.position.y = Math.sin(t * 0.9 + o.phase) * 0.14;
      o.float.position.x = Math.cos(t * 0.55 + o.phase) * 0.05;
      o.float.rotation.z = Math.sin(t * 0.5 + o.phase) * 0.06;
    }

    // moneda: giro continuo con leve cabeceo
    coin.spin.rotation.y = t * 0.75;
    coin.spin.rotation.x = Math.sin(t * 0.6) * 0.22;
    coinSmall.spin.rotation.y = -t * 0.9 + 1.2;
    coinSmall.spin.rotation.x = 0.3 + Math.sin(t * 0.7) * 0.15;
    // cristal ETH: rotación lenta, ligeramente inclinado
    eth.spin.rotation.y = t * 0.5;
    eth.spin.rotation.z = 0.12 + Math.sin(t * 0.4) * 0.05;
    // cadena: vaivén para que siempre se lea de frente
    chain.spin.rotation.y = -0.35 + Math.sin(t * 0.35) * 0.3;
    chain.spin.rotation.x = 0.25 + Math.sin(t * 0.5) * 0.06;

    // órbita
    orbit.rotation.z = 0.35 + t * 0.25;
    orbitNodes.forEach((node, i) => {
      const a = t * 0.9 + (i * Math.PI * 2) / orbitNodes.length;
      node.position.set(Math.cos(a) * ORBIT, Math.sin(a) * ORBIT, 0);
    });

    // bloques: el pulso viaja de bloque en bloque
    const speed = 2.2;
    const step = 0.9;
    blocks.forEach((b, i) => {
      const p = spike(t * speed - i * step);
      b.edgeMat.opacity = edgeBase + (1 - edgeBase) * p;
      b.coreMat.color.copy(coreDim).lerp(coreBright, p);
      b.core.scale.setScalar(1 + p * 0.35);
    });
    const travel = (((t * speed - Math.PI / 2) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const idx = travel / step;
    const pm = packet.material as THREE.SpriteMaterial;
    if (idx <= BLOCKS - 1) {
      const i0 = Math.floor(idx);
      const i1 = Math.min(BLOCKS - 1, i0 + 1);
      packet.position.lerpVectors(blockAt(i0, from), blockAt(i1, to), idx - i0);
      packet.position.z += 0.45;
      const edgeFade = Math.min(1, idx * 3, (BLOCKS - 1 - idx) * 3);
      pm.opacity = Math.max(0, edgeFade);
      pm.rotation = t * 2;
    } else {
      pm.opacity = 0;
    }

    // halos que respiran
    for (const g of glowSprites) {
      const breath = 0.85 + Math.sin(t * 1.1 + g.phase) * 0.15;
      g.sprite.material.opacity = glowOpacity * breath;
      g.sprite.scale.setScalar(g.base * (0.95 + breath * 0.08));
    }
    // destellos tipo "glint": un flash corto cada pocos segundos
    for (const g of glints) {
      const flash = reducedMotion ? 0.7 : spike(t * g.speed + g.phase, 18);
      g.sprite.material.opacity = glintOpacity * flash;
      g.sprite.scale.setScalar(g.base * (0.3 + flash * 0.9));
      g.sprite.material.rotation = t * 0.6 + g.phase;
    }

    sparkleUniforms.uTime.value = t;

    // parallax con el puntero (suavizado)
    tilt.lerp(pointer, reducedMotion ? 1 : 0.05);
    root.rotation.y = tilt.x * 0.14;
    root.rotation.x = -tilt.y * 0.08;
    camera.position.x = tilt.x * 0.35;
    camera.position.y = tilt.y * 0.2;
    camera.lookAt(0, 0, 0);
  }

  function render(t: number) {
    update(t);
    renderer.render(scene, camera);
    if (firstFrame) {
      firstFrame = false;
      onFirstFrame?.();
    }
  }

  function tick(now: number) {
    // dt acotado: tras una pausa o con fps bajos el movimiento no da saltos
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    elapsed += dt;
    startedAt ||= now;
    introT = (now - startedAt) / 1000;
    render(elapsed);
  }

  function setActive(active: boolean) {
    if (reducedMotion) {
      if (active) render(elapsed);
      return;
    }
    if (active === running) return;
    running = active;
    last = 0;
    renderer.setAnimationLoop(active ? tick : null);
  }

  return {
    layout,
    setTheme(next) {
      if (next === theme) return;
      applyTheme(next);
      if (!running) render(elapsed);
    },
    setPointer(x, y) {
      if (reducedMotion) return;
      pointer.set(Math.max(-1, Math.min(1, x)), Math.max(-1, Math.min(1, y)));
    },
    setActive,
    dispose() {
      renderer.setAnimationLoop(null);
      running = false;
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      textures.forEach((t) => t.dispose());
      envTexture.dispose();
      pmrem.dispose();
      renderer.dispose();
    },
  };
}
