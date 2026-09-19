import { Fragment } from "react";
import Link from "next/link";
import type { Metadata } from "next";

import { getPublishedPosts } from "@/features/blog/queries";
import { type PostListItem } from "@/features/blog/types";
import { getPublishedProjects } from "@/features/projects/queries";
import { type ProjectListItem } from "@/features/projects/types";
import { isWeb3Project } from "@/features/projects/web3";
import { getContentBlocks, getSectionsConfig } from "@/features/content/queries";
import { resolveBlock, orderSections } from "@/features/content/resolve";

import { PostCard } from "@/features/blog/components/PostCard/PostCard";
import { CryptoHero } from "@/features/crypto/components/CryptoHero/CryptoHero";
import { CryptoEducation } from "@/features/crypto/components/CryptoEducation/CryptoEducation";
import { Web3Projects } from "@/features/crypto/components/Web3Projects/Web3Projects";
import { CryptoFaq } from "@/features/crypto/components/CryptoFaq/CryptoFaq";
import { CryptoCta } from "@/features/crypto/components/CryptoCta/CryptoCta";
import { CRYPTO_FAQ } from "@/features/crypto/faq";

import styles from "./crypto.module.css";

export const revalidate = 3600;

const CRYPTO_SECTIONS = ["hero", "education", "projects", "posts", "faq", "cta"] as const;

export const metadata: Metadata = {
  title: "Crypto & Web3",
  description:
    "Desarrollo Web3 y blockchain con interfaces claras: dApps, wallets y contratos sin fricción.",
  alternates: { canonical: "/crypto" },
};

export default async function CryptoPage() {
  const [allProjects, posts, content, sectionsCfg] = await Promise.all([
    getPublishedProjects(),
    getPublishedPosts(),
    getContentBlocks("crypto"),
    getSectionsConfig("crypto"),
  ]);

  const web3Projects: ProjectListItem[] = allProjects.filter(isWeb3Project);
  const cryptoPosts: PostListItem[] = posts
    .filter((post) => post.tags.some((tag) => tag.toLowerCase() === "crypto"))
    .slice(0, 3)
    .map((post) => ({
      id: post.id,
      slug: post.slug,
      coverUrl: post.coverUrl,
      tags: post.tags,
      title: post.title,
      excerpt: post.excerpt,
      dateLabel: post.publishedAt
        ? new Date(post.publishedAt).toLocaleDateString("es", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "",
      readMinutes: post.readMinutes ?? 3,
    }));

  const hero = resolveBlock(content, "crypto.hero", {
    title: "Web3 y blockchain sin fricción",
    body: "Interfaces claras para un mundo complejo.",
  });
  const tPosts = resolveBlock(content, "crypto.posts", {
    title: "Últimos artículos sobre crypto",
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
    posts:
      cryptoPosts.length > 0 ? (
        <section className={styles.section}>
          <header className={styles.head}>
            <h2 className={styles.h2}>{tPosts.title}</h2>
            <Link href="/blog" className={styles.seeAll}>
              Ver todo →
            </Link>
          </header>
          <div className={styles.grid}>
            {cryptoPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      ) : null,
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
