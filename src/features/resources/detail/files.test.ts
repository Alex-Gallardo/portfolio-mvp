import { test } from "node:test";
import assert from "node:assert/strict";

import { extensionOf, fileKind, fillRelated } from "./files";
import { FLAT, computeTilt } from "../../../lib/tilt";

test("extensionOf: minúsculas, sin punto; sin extensión → vacío", () => {
  assert.equal(extensionOf("kit.ZIP"), "zip");
  assert.equal(extensionOf("archivo.tar.gz"), "gz");
  assert.equal(extensionOf("README"), "");
  assert.equal(extensionOf(".env"), "");
  assert.equal(extensionOf("raro."), "");
});

test("fileKind: la extensión manda", () => {
  assert.equal(fileKind("checklist-seo.pdf", "application/pdf"), "pdf");
  assert.equal(fileKind("portafolio.fig", "application/octet-stream"), "figma");
  assert.equal(fileKind("kit-componentes.zip", "application/zip"), "archive");
  assert.equal(fileKind("guia.docx", null), "doc");
  assert.equal(fileKind("datos.csv", null), "sheet");
  assert.equal(fileKind("portada.webp", null), "image");
  assert.equal(fileKind("snippet.tsx", null), "code");
});

test("fileKind: sin extensión conocida, el MIME desempata", () => {
  assert.equal(fileKind("descarga", "application/pdf"), "pdf");
  assert.equal(fileKind("descarga", "image/png"), "image");
  assert.equal(fileKind("descarga", "application/x-zip-compressed"), "archive");
  assert.equal(fileKind("descarga", "text/csv"), "sheet");
  assert.equal(fileKind("descarga", "text/plain"), "doc");
  assert.equal(fileKind("descarga", "application/octet-stream"), "file");
  assert.equal(fileKind("descarga"), "file");
});

const r = (slug: string) => ({ slug });

test("fillRelated: misma categoría primero, luego el resto, sin repetir", () => {
  const out = fillRelated([r("a"), r("b")], [r("x"), r("a"), r("y")], "me");
  assert.deepEqual(
    out.map((i) => i.slug),
    ["a", "b", "x"],
  );
});

test("fillRelated: nunca incluye el recurso abierto y respeta el límite", () => {
  const out = fillRelated([], [r("me"), r("x"), r("y"), r("z"), r("w")], "me", 3);
  assert.deepEqual(
    out.map((i) => i.slug),
    ["x", "y", "z"],
  );
  assert.deepEqual(fillRelated([], [], "me"), []);
});

test("computeTilt con paso: los grados van por fotogramas", () => {
  const rect = { left: 0, top: 0, width: 100, height: 100 };
  assert.deepEqual(computeTilt(50, 50, rect, 6, 2), FLAT);
  // 73% a la derecha → 2.76° sin paso; con paso 2 → 2°
  assert.equal(computeTilt(73, 50, rect, 6, 2).ry, 2);
  assert.equal(computeTilt(100, 0, rect, 6, 2).rx, 6);
  assert.equal(computeTilt(100, 0, rect, 6, 2).ry, 6);
  // sin paso se comporta como antes
  assert.equal(computeTilt(73, 50, rect, 6).ry, 2.76);
});
