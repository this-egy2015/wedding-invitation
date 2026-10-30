import assert from "node:assert/strict";
import { test } from "node:test";
import { formatEventTime, zonedTimeToUtc } from "./time.ts";

test("converts WIB wall-clock time to UTC", () => {
  assert.equal(zonedTimeToUtc("2026-12-12T08:00", "Asia/Jakarta").toISOString(), "2026-12-12T01:00:00.000Z");
});

test("converts WIT across the date boundary", () => {
  assert.equal(zonedTimeToUtc("2026-12-12T07:30", "Asia/Jayapura").toISOString(), "2026-12-11T22:30:00.000Z");
});

test("respects DST offsets", () => {
  assert.equal(zonedTimeToUtc("2026-07-01T10:00", "America/New_York").toISOString(), "2026-07-01T14:00:00.000Z");
  assert.equal(zonedTimeToUtc("2026-01-15T10:00", "America/New_York").toISOString(), "2026-01-15T15:00:00.000Z");
});

test("formats time in the event time zone regardless of server zone", () => {
  assert.match(formatEventTime("2026-12-12T08:00", "Asia/Makassar"), /08[.:]00.*WITA/);
});
