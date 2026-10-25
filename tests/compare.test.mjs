import assert from "node:assert/strict";
import test from "node:test";
import { compareReadings, comparisonStrengths, comparisonText } from "../src/compare.js";

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

test("duel strengths show only checks one repo passes and the other misses", () => {
  const left = { ...first, signals: [
    { label: "Visual proof", passed: true },
    { label: "Live demo", passed: false },
    { label: "License", passed: true },
    { label: "Three or more topics", passed: true }
  ] };
  const right = { ...second, signals: [
    { label: "Visual proof", passed: false },
    { label: "Live demo", passed: true },
    { label: "License", passed: true }
  ] };
  assert.deepEqual(comparisonStrengths(left, right), {
    firstOnly: ["Visual proof"],
    secondOnly: ["Live demo"]
  });
  const copy = comparisonText(left, right, "https://example.com/duel");
  assert.match(copy, /owner\/first leads on: Visual proof\./);
  assert.match(copy, /owner\/second leads on: Live demo\./);
  assert.doesNotMatch(copy, /leads on:.*License/);
  assert.doesNotMatch(copy, /leads on:.*Three or more topics/);
});
