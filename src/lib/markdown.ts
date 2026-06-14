import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root, Element } from "hast";

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3;
}

/**
 * Convierte markdown → HTML con anclas en h2/h3 y resaltado de código.
 * Recolecta los headings (h2/h3) para construir la tabla de contenidos.
 * Se ejecuta en el servidor; el cliente no carga nada de esto.
 */
export async function renderMarkdown(markdown: string): Promise<{ html: string; toc: TocItem[] }> {
  const toc: TocItem[] = [];

  // Plugin local: corre DESPUÉS de rehype-slug (ids ya asignados) y
  // ANTES del autolink, para leer el texto limpio del heading.
  const collectHeadings = () => (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      const id = node.properties?.id;
      if ((node.tagName === "h2" || node.tagName === "h3") && typeof id === "string") {
        toc.push({ id, text: toString(node), depth: node.tagName === "h2" ? 2 : 3 });
      }
    });
  };

  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(collectHeadings)
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeHighlight, { detect: true, ignoreMissing: true })
    .use(rehypeStringify)
    .process(markdown);

  return { html: String(file), toc };
}
