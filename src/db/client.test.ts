import assert from "node:assert/strict";
import { mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { connectDatabase } from "./client.ts";

test("Vercel requires remote credentials; remote URL cannot bypass private local file checks", async () => {
  await assert.rejects(() => connectDatabase({ VERCEL: "1" }), /wajib/);
  for (const url of ["file:public/leaked.sqlite", "http://database.test", "https://user:pass@database.test"]) {
    await assert.rejects(() => connectDatabase({ TURSO_DATABASE_URL: url, TURSO_AUTH_TOKEN: "test-only" }));
  }
  await assert.rejects(() => connectDatabase({ TURSO_DATABASE_URL: "libsql://database.test" }));
  await assert.rejects(() => connectDatabase({ TURSO_AUTH_TOKEN: "test-only" }));
});

test("local libSQL preserves private files and enforces foreign keys inside transactions", async (t) => {
  const directory = mkdtempSync(join(tmpdir(), "libsql-test-"));
  const filename = join(directory, "test.sqlite");
  const client = await connectDatabase({ SQLITE_PATH: filename });
  t.after(() => { client.close(); rmSync(directory, { recursive: true, force: true }); });
  assert.equal(statSync(filename).mode & 0o777, 0o600);
  assert.equal((await client.execute("PRAGMA foreign_keys")).rows[0][0], 1);
  await client.execute("CREATE TABLE parent (id TEXT PRIMARY KEY)");
  await client.execute("CREATE TABLE child (parent_id TEXT REFERENCES parent(id))");
  const tx = await client.transaction("write");
  try {
    await assert.rejects(() => tx.execute("INSERT INTO child VALUES ('missing')"));
    await tx.rollback();
  } finally { tx.close(); }
});
