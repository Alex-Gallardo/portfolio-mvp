import { test } from "node:test";
import assert from "node:assert/strict";

import { plainTitle, splitTitle } from "./title";

test("resalta el texto marcado con asteriscos", () => {
  assert.deepEqual(splitTitle("Web3 y blockchain sin *fricción*"), {
    before: "Web3 y blockchain sin ",
    highlight: "fricción",
    after: "",
  });
});

test("la marca puede ir en medio y abarcar varias palabras", () => {
  assert.deepEqual(splitTitle("Construye *dApps claras* para todos"), {
    before: "Construye ",
    highlight: "dApps claras",
    after: " para todos",
  });
});

test("sin marca resalta la última palabra", () => {
  assert.deepEqual(splitTitle("Web3 y blockchain sin fricción"), {
    before: "Web3 y blockchain sin ",
    highlight: "fricción",
    after: "",
  });
});

test("una sola palabra queda resaltada entera", () => {
  assert.deepEqual(splitTitle("Web3"), { before: "", highlight: "Web3", after: "" });
});

test("título vacío o solo espacios no rompe", () => {
  assert.deepEqual(splitTitle("   "), { before: "", highlight: "", after: "" });
});

test("normaliza espacios y descarta asteriscos sueltos", () => {
  assert.deepEqual(splitTitle("  Web3   *sin*  fricción * "), {
    before: "Web3 ",
    highlight: "sin",
    after: " fricción ",
  });
  assert.deepEqual(splitTitle("Web3 ** vacío"), {
    before: "Web3 ",
    highlight: "vacío",
    after: "",
  });
});

test("plainTitle devuelve el texto sin marcas", () => {
  assert.equal(plainTitle("Web3 y blockchain sin *fricción*"), "Web3 y blockchain sin fricción");
});
