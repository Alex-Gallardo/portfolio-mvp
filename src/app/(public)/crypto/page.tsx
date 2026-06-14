import type { Metadata } from "next";

import { getPublishedProjects } from "@/features/projects/queries";
import { type ProjectListItem } from "@/features/projects/types";
import { isWeb3Project } from "@/features/projects/web3";

import { CryptoHero } from "@/features/crypto/components/CryptoHero/CryptoHero";
import { CryptoEducation } from "@/features/crypto/components/CryptoEducation/CryptoEducation";
import { Web3Projects } from "@/features/crypto/components/Web3Projects/Web3Projects";
import { CryptoFaq } from "@/features/crypto/components/CryptoFaq/CryptoFaq";
import { CryptoCta } from "@/features/crypto/components/CryptoCta/CryptoCta";
import { CRYPTO_FAQ } from "@/features/crypto/faq";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Crypto & Web3",
  description:
    "Desarrollo Web3 y blockchain con interfaces claras: dApps, wallets y contratos sin fricción.",
  alternates: { canonical: "/crypto" },
};

export default async function CryptoPage() {
  const allProjects = await getPublishedProjects();
  const web3Projects: ProjectListItem[] = allProjects.filter(isWeb3Project);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: CRYPTO_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <CryptoHero />
      <CryptoEducation />
      <Web3Projects projects={web3Projects} />
      <CryptoFaq />
      <CryptoCta />
    </>
  );
}
