import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/JsonLd";
import { DesignScrollExperience } from "@/features/design/components/DesignScrollExperience/DesignScrollExperience";
import {
  DESIGN_DESKTOP_FRAMES,
  DESIGN_MOBILE_FRAMES,
  resolveDesignChapters,
} from "@/features/design/design-content";
import { getContentBlocks } from "@/features/content/queries";
import { serviceJsonLd } from "@/lib/seo";

import styles from "./design.module.css";

export const metadata: Metadata = {
  title: "Diseño 3D",
  description:
    "Personajes, modelos, estructuras, arquitectura y renders 3D que convierten ideas en experiencias visuales memorables.",
  alternates: { canonical: "/design" },
  openGraph: {
    title: "Diseño 3D",
    description: "Forma, luz y movimiento para hacer visible lo que todavía no existe.",
    images: [
      {
        url: "/design/sequence/desktop/frame-05.webp",
        width: 1672,
        height: 941,
        alt: "Diseño 3D aplicado a personajes, producto y arquitectura",
      },
    ],
  },
};

const CAPABILITIES = [
  {
    number: "01",
    title: "Personajes",
    body: "Identidad, silueta y presencia para mundos que necesitan un protagonista.",
  },
  {
    number: "02",
    title: "Modelos y producto",
    body: "Objetos precisos, materiales creíbles y renders que comunican valor.",
  },
  {
    number: "03",
    title: "Arquitectura",
    body: "Espacios, estructuras y atmósferas que permiten habitar una idea antes de construirla.",
  },
  {
    number: "04",
    title: "Visualización",
    body: "Imágenes contemporáneas para presentar, explicar y hacer sentir un proyecto.",
  },
] as const;

export default async function DesignPage() {
  const content = await getContentBlocks("design");
  const chapters = resolveDesignChapters(content);
  const serviceLd = serviceJsonLd({
    name: "Diseño 3D",
    description:
      "Diseño de personajes, modelos, estructuras, arquitectura y renders 3D para múltiples industrias.",
    path: "/design",
  });

  return (
    <main className={styles.page}>
      <JsonLd data={serviceLd} />
      <DesignScrollExperience
        desktopFrames={DESIGN_DESKTOP_FRAMES}
        mobileFrames={DESIGN_MOBILE_FRAMES}
        chapters={chapters}
      />

      <section className={styles.capabilities} aria-labelledby="design-capabilities-title">
        <div className={styles.capabilitiesInner}>
          <header className={styles.capabilitiesHeader}>
            <p className={styles.eyebrow}>Un lenguaje · Muchas industrias</p>
            <h2 id="design-capabilities-title" className={styles.h2}>
              Diseño para lo que aún no tiene forma.
            </h2>
          </header>
          <div className={styles.grid}>
            {CAPABILITIES.map((capability) => (
              <article key={capability.number} className={styles.card}>
                <span className={styles.number} aria-hidden="true">
                  {capability.number}
                </span>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
