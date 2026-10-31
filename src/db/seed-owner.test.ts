import assert from "node:assert/strict";
import { test } from "node:test";
import { createClient } from "@supabase/supabase-js";
import { findOrCreateSeedOwner } from "../../scripts/seed-owner.ts";

test("owner lookup paginates and reuses the matching email without creating a second user", async () => {
  const pages: string[] = [];
  const admin = createClient("https://auth.example.com", "test-only", {
    auth: { persistSession: false }, global: { fetch: async (input, init) => {
      assert.equal(init?.method, "GET");
      const page = new URL(String(input)).searchParams.get("page")!;
      pages.push(page);
      const users = page === "1" ? Array.from({ length: 100 }, (_, i) => ({ id: `other-${i}`, email: `other-${i}@example.com` })) : [{ id: "existing-owner", email: "Owner@example.com" }];
      return Response.json({ users });
    } },
  }).auth.admin;
  assert.equal(await findOrCreateSeedOwner(admin, " owner@example.com "), "existing-owner");
  assert.deepEqual(pages, ["1", "2"]);
});

test("new seed owner is unconfirmed; invalid email and provider errors do not create users", async () => {
  let creates = 0;
  let failList = false;
  const admin = createClient("https://auth.example.com", "test-only", {
    auth: { persistSession: false }, global: { fetch: async (_input, init) => {
      if (init?.method === "GET") return failList
        ? Response.json({ message: "Forbidden" }, { status: 403 }) : Response.json({ users: [] });
      assert.equal(init?.method, "POST");
      creates++;
      const body = JSON.parse(String(init?.body));
      assert.equal(body.email, "owner@example.com");
      assert.equal(body.email_confirm, false);
      assert.equal(body.password, undefined);
      return Response.json({ id: "new-owner", email: body.email });
    } },
  }).auth.admin;
  await assert.rejects(() => findOrCreateSeedOwner(admin, "not-an-email"));
  assert.equal(creates, 0);
  assert.equal(await findOrCreateSeedOwner(admin, "OWNER@example.com"), "new-owner");
  failList = true;
  await assert.rejects(() => findOrCreateSeedOwner(admin, "another@example.com"));
  assert.equal(creates, 1);
});
