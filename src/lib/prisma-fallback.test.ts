import assert from "node:assert/strict";
import test from "node:test";
import {
  isDatabaseUnavailable,
  withDatabaseFallback,
  withPublicDatabaseFallback,
} from "./prisma-fallback";

test("recognizes transient Prisma errors across bundle boundaries", () => {
  assert.equal(isDatabaseUnavailable({ code: "P1001" }), true);
  assert.equal(isDatabaseUnavailable({ code: "P2024" }), true);
  assert.equal(isDatabaseUnavailable({ code: "P1000" }), false);
  assert.equal(isDatabaseUnavailable({ code: "P2002" }), false);
  assert.equal(
    isDatabaseUnavailable({ name: "PrismaClientInitializationError", retryable: true }),
    true,
  );
  assert.equal(
    isDatabaseUnavailable({
      name: "PrismaClientInitializationError",
      message: "Can't reach database server at db.example.test:6543",
    }),
    true,
  );
  assert.equal(
    isDatabaseUnavailable({
      name: "PrismaClientInitializationError",
      message: "Authentication failed against database server",
    }),
    false,
  );
  assert.equal(isDatabaseUnavailable(new Error("application bug")), false);
});

test("returns a fallback only when the database is unavailable", async () => {
  const fallback = await withDatabaseFallback(
    async () => Promise.reject({ code: "P1001" }),
    "offline",
  );

  assert.equal(fallback, "offline");
});

test("keeps the public alias and rethrows unexpected failures", async () => {
  const failure = new Error("query is invalid");

  await assert.rejects(() => withPublicDatabaseFallback(async () => Promise.reject(failure), []), {
    message: "query is invalid",
  });
});
