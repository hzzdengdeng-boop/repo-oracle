import assert from "node:assert/strict";
import test from "node:test";
import { compareReadings, comparisonText } from "../src/compare.js";

const first = { title: "owner/first", score: 82, scoreTitle: "Star Potential", readmeOnly: false };
const second = { title: "owner/second", score: 71, scoreTitle: "Star Potential", readmeOnly: false };

test("a comparable reading names the winner and margin", () => {
  assert.deepEqual(compareReadings(first, second), {
    comparable: true,
    verdict: "owner/first wins by 11 points."
  });
  assert.equal(compareReadings(second, first).verdict, "owner/first wins by 11 points.");
});

test("a tie does not invent a winner", () => {
  assert.match(compareReadings(first, { ...second, score: 82 }).verdict, /tie/i);
});

test("README-only and full scores are not ranked against each other", () => {
  const mixed = { ...second, score: 99, scoreTitle: "README Readiness", readmeOnly: true };
  assert.deepEqual(compareReadings(first, mixed), {
    comparable: false,
    verdict: "Different score modes. No winner declared."
  });
  const text = comparisonText(first, mixed, "https://example.com/?repo=owner%2Ffirst&vs=owner%2Fsecond");
  assert.match(text, /No winner declared/);
  assert.match(text, /README Readiness/);
  assert.match(text, /vs=owner%2Fsecond/);
});
