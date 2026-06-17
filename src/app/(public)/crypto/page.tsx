import { Fragment } from "react";
import type { Metadata } from "next";

import { getPublishedProjects } from "@/features/projects/queries";
import { type ProjectListItem } from "@/features/projects/types";
import { isWeb3Project } from "@/features/projects/web3";
import { getContentBlocks, getSectionsConfig } from "@/features/content/queries";
import { resolveBlock, orderSections } from "@/features/content/resolve";

import { CryptoHero } from "@/features/crypto/components/CryptoHero/CryptoHero";
import { CryptoEducation } from "@/features/crypto/components/CryptoEducation/CryptoEducation";
import { Web3Projects } from "@/features/crypto/components/Web3Projects/Web3Projects";
import { CryptoFaq } from "@/features/crypto/components/CryptoFaq/CryptoFaq";
import { CryptoCta } from "@/features/crypto/components/CryptoCta/CryptoCta";
import { CRYPTO_FAQ } from "@/features/crypto/faq";

export const revalidate = 3600;

const CRYPTO_SECTIONS = ["hero", "education", "projects", "faq", "cta"] as const;

export const metadata: Metadata = {
  title: "Crypto & Web3",
  description:
    "Desarrollo Web3 y blockchain con interfaces claras: dApps, wallets y contratos sin fricción.",
  alternates: { canonical: "/crypto" },
};

export default async function CryptoPage() {
  const [allProjects, content, sectionsCfg] = await Promise.all([
    getPublishedProjects(),
    getContentBlocks("crypto"),
    getSectionsConfig("crypto"),
  ]);

  const web3Projects: ProjectListItem[] = allProjects.filter(isWeb3Project);

  const hero = resolveBlock(content, "crypto.hero", {
    title: "Web3 y blockchain sin fricción",
    body: "Interfaces claras para un mundo complejo.",
  });

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CRYPTO_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  const sections: Record<string, React.ReactNode> = {
    hero: <CryptoHero title={hero.title ?? undefined} subtitle={hero.body || undefined} />,
    education: <CryptoEducation />,
    projects: <Web3Projects projects={web3Projects} />,
    faq: <CryptoFaq />,
    cta: <CryptoCta />,
  };

  const order = orderSections([...CRYPTO_SECTIONS], sectionsCfg);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {order.map((key) => (
        <Fragment key={key}>{sections[key]}</Fragment>
      ))}
    </>
  );
}
