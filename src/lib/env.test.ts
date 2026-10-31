import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("Vercel accepts integration key aliases and rejects localhost service URLs", () => {
  const code = `const {env}=await import('./src/env.ts'); if(env.SUPABASE_ANON_KEY!=='test-publishable')throw Error('alias');`;
  const environment = {
    ...process.env, VERCEL: "1", SITE_URL: "https://wedding.example.com",
    SUPABASE_URL: "https://project.supabase.co", SUPABASE_ANON_KEY: undefined,
    SUPABASE_PUBLISHABLE_KEY: "test-publishable",
  };
  const run = (env: NodeJS.ProcessEnv) => spawnSync(process.execPath, ["--input-type=module", "-e", code], { env, encoding: "utf8" });
  assert.equal(run(environment).status, 0);
  assert.notEqual(run({ ...environment, SUPABASE_URL: "http://127.0.0.1:54321" }).status, 0);
  assert.notEqual(run({ ...environment, SITE_URL: "http://localhost:3000" }).status, 0);
});
