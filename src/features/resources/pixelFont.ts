import { Pixelify_Sans } from "next/font/google";

/** Fuente pixel de la sección de recursos (cards, hero de la tienda, CTA).
 *  Definida una sola vez: cada llamada a next/font aloja una instancia nueva,
 *  así que todos los consumidores importan esta constante. */
export const pixelFont = Pixelify_Sans({
  subsets: ["latin"],
  variable: "--font-pixel",
  display: "swap",
});
