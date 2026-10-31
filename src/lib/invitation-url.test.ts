import assert from "node:assert/strict";
import { test } from "node:test";
import { invitationPath, isPublicInvitationSlug } from "./invitation-url.ts";

test("public slugs cannot shadow application routes or asset paths", () => {
  for (const value of ["home", "login", "dashboard", "auth", "invite", "api", "assets", "templates", "berubah", "_next", "favicon.ico", "a/b", "../login", "A-B", "ab", "a".repeat(61)]) {
    assert.equal(isPublicInvitationSlug(value), false, value);
  }
  for (const value of ["demo-fajar-nadya", "abc", "wedding-2026", "a".repeat(60)]) {
    assert.equal(isPublicInvitationSlug(value), true, value);
  }
});

test("invitation links use the root slug and preserve an optional personal token", () => {
  assert.equal(invitationPath("demo-fajar-nadya"), "/demo-fajar-nadya");
  assert.equal(invitationPath("demo-fajar-nadya", null), "/demo-fajar-nadya");
  assert.equal(invitationPath("demo-fajar-nadya", "abc_123-def"), "/demo-fajar-nadya?to=abc_123-def");
  assert.equal(invitationPath("test", "x&next=/login"), "/test?to=x%26next%3D%2Flogin");
});
