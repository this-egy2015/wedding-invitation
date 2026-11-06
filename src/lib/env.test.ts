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

test("missing SITE_URL uses Vercel's matching environment domain without overriding explicit configuration", () => {
  const environment: NodeJS.ProcessEnv = {
    ...process.env, VERCEL: "1", VERCEL_ENV: "production", SITE_URL: undefined,
    VERCEL_PROJECT_PRODUCTION_URL: "wedding.example.com", VERCEL_URL: "wedding-123.vercel.app",
    SUPABASE_URL: "https://project.supabase.co", SUPABASE_ANON_KEY: "test-only",
  };
  const code = `const {env}=await import('./src/env.ts'); process.stdout.write(env.SITE_URL);`;
  const run = (overrides: Partial<NodeJS.ProcessEnv> = {}) => spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    env: { ...environment, ...overrides }, encoding: "utf8",
  });
  assert.equal(run().stdout, "https://wedding.example.com");
  assert.equal(run({ VERCEL_ENV: "preview" }).stdout, "https://wedding-123.vercel.app");
  assert.equal(run({ VERCEL_PROJECT_PRODUCTION_URL: undefined }).stdout, "https://wedding-123.vercel.app");
  assert.equal(run({ SITE_URL: "https://custom.example.com" }).stdout, "https://custom.example.com");
  assert.notEqual(run({ SITE_URL: "http://localhost:3000" }).status, 0);
  assert.notEqual(run({ SITE_URL: "" }).status, 0);
  assert.notEqual(run({ VERCEL: undefined }).status, 0);
  assert.notEqual(run({ VERCEL_URL: undefined, VERCEL_PROJECT_PRODUCTION_URL: undefined }).status, 0);
});

test("custom site origin normalizes links and rejects credentials, paths and non-web schemes", () => {
  const environment = {
    ...process.env, VERCEL: "1", VERCEL_ENV: "production",
    SUPABASE_URL: "https://project.supabase.co", SUPABASE_ANON_KEY: "test-only",
    VERCEL_PROJECT_PRODUCTION_URL: "wedding-old.vercel.app",
  };
  const code = `const {env}=await import('./src/env.ts'); process.stdout.write(JSON.stringify({origin:env.SITE_URL,callback:env.SITE_URL+'/auth/callback',guest:env.SITE_URL+'/gaby-afdhal?to=example-token'}));`;
  const run = (SITE_URL: string) => spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    env: { ...environment, SITE_URL }, encoding: "utf8",
  });
  const result = run("https://INVITATION.riburupa.com/");
  assert.equal(result.status, 0);
  assert.deepEqual(JSON.parse(result.stdout), {
    origin: "https://invitation.riburupa.com",
    callback: "https://invitation.riburupa.com/auth/callback",
    guest: "https://invitation.riburupa.com/gaby-afdhal?to=example-token",
  });
  for (const value of ["https://user:pass@invitation.riburupa.com", "https://invitation.riburupa.com/login",
    "https://invitation.riburupa.com/?to=secret", "https://invitation.riburupa.com/#section",
    "ftp://invitation.riburupa.com", "http://invitation.riburupa.com"]) assert.notEqual(run(value).status, 0, value);
  const local = spawnSync(process.execPath, ["--input-type=module", "-e", code], {
    env: { ...environment, VERCEL: undefined, SITE_URL: "http://localhost:3000/" }, encoding: "utf8",
  });
  assert.equal(local.status, 0);
  assert.equal(JSON.parse(local.stdout).origin, "http://localhost:3000");
});
