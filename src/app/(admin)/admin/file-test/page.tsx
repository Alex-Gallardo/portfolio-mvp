"use client";

import { useState } from "react";
import { FileRepeater } from "@/features/admin/FileRepeater/FileRepeater";
import { type FileItem } from "@/features/admin/FileRepeater/types";

export default function FileTestPage() {
  const [items, setItems] = useState<FileItem[]>([]);

  return (
    <section>
      <h1>Prueba de FileRepeater</h1>
      <p>
        Sube archivos al bucket privado <code>files</code>. Luego revísalos en Supabase → Storage.
      </p>

      <FileRepeater bucket="files" prefix="test" items={items} onChange={setItems} />

      <h2 style={{ marginTop: 24 }}>Estado actual (lo que iría a la DB):</h2>
      <pre style={{ background: "var(--bg-elev)", padding: 16, borderRadius: 8, overflow: "auto" }}>
        {JSON.stringify(items, null, 2)}
      </pre>
    </section>
  );
}
