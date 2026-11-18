import assert from "node:assert/strict";
import test from "node:test";
import { formatINR } from "./format-currency.ts";

test("formats currency with Indian digit grouping and INR", () => {
  assert.equal(formatINR(1234567.5), "₹12,34,567.50");
});

test("rejects non-finite amounts", () => {
  assert.throws(() => formatINR(Number.NaN), RangeError);
});
