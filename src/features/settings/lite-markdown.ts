function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(
      /\[([^\]]+)\]\(([^)\s]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

/** Subconjunto seguro de markdown solo para PREVIEW (escapa HTML primero). */
export function renderLite(md: string): string {
  const lines = escapeHtml(md).split(/\r?\n/);
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith("### ")) {
      closeList();
      out.push(`<h4>${inline(t.slice(4))}</h4>`);
    } else if (t.startsWith("## ")) {
      closeList();
      out.push(`<h3>${inline(t.slice(3))}</h3>`);
    } else if (t.startsWith("# ")) {
      closeList();
      out.push(`<h2>${inline(t.slice(2))}</h2>`);
    } else if (t.startsWith("- ")) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(t.slice(2))}</li>`);
    } else if (t === "") {
      closeList();
    } else {
      closeList();
      out.push(`<p>${inline(t)}</p>`);
    }
  }
  closeList();
  return out.join("");
}
