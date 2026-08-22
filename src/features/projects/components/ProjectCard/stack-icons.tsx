/**
 * Iconos de stack para ProjectCard.
 *
 * OJO: aquí NO usamos `import * as simpleIcons` como en StackBand.
 * StackBand es server-only, pero ProjectCard también se renderiza dentro de
 * Web3Projects, que es "use client" — un namespace import con acceso dinámico
 * (registry[name]) no hace tree-shaking y arrastraría el paquete completo
 * al bundle del cliente. Con imports nombrados y `sideEffects: false` en
 * simple-icons, solo viajan los paths que realmente usamos.
 *
 * Verificado contra simple-icons 16.x. Si agregas uno nuevo, comprueba que el
 * export exista (p. ej. `siCss3` ya no existe; ahora es `siCss`).
 */
import {
  siNextdotjs,
  siReact,
  siTypescript,
  siJavascript,
  siNodedotjs,
  siCss,
  siTailwindcss,
  siPostgresql,
  siPrisma,
  siSupabase,
  siVercel,
  siSolidity,
  siEthereum,
  siWeb3dotjs,
  siOpenzeppelin,
  siPython,
  siFigma,
  siGit,
  siDocker,
  siStripe,
  siFramer,
  siZod,
} from "simple-icons";

/** minúsculas y sin separadores: "Next.js" → "nextjs", "ethers.js" → "ethersjs" */
function key(label: string): string {
  return label.toLowerCase().replace(/[\s._/-]/g, "");
}

const ICONS: Record<string, { path: string }> = {
  nextjs: siNextdotjs,
  next: siNextdotjs,
  react: siReact,
  typescript: siTypescript,
  ts: siTypescript,
  javascript: siJavascript,
  js: siJavascript,
  nodejs: siNodedotjs,
  node: siNodedotjs,
  css: siCss,
  tailwind: siTailwindcss,
  tailwindcss: siTailwindcss,
  postgresql: siPostgresql,
  postgres: siPostgresql,
  prisma: siPrisma,
  supabase: siSupabase,
  vercel: siVercel,
  solidity: siSolidity,
  ethereum: siEthereum,
  ethers: siEthereum,
  ethersjs: siEthereum,
  web3js: siWeb3dotjs,
  wagmi: siEthereum,
  openzeppelin: siOpenzeppelin,
  python: siPython,
  figma: siFigma,
  git: siGit,
  docker: siDocker,
  stripe: siStripe,
  framermotion: siFramer,
  framer: siFramer,
  zod: siZod,
};

/** Path del logo (viewBox 0 0 24 24) o null si la tecnología no tiene icono. */
export function techIconPath(label: string): string | null {
  return ICONS[key(label)]?.path ?? null;
}
