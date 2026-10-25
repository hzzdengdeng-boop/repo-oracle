import assert from "node:assert/strict";
import test from "node:test";

import { exampleRepos, pickExample } from "../src/examples.js";

test("picks a deterministic example from the curated list", () => {
  assert.equal(pickExample(() => 0), exampleRepos[0]);
  assert.equal(pickExample(() => 0.999), exampleRepos.at(-1));
});

test("does not immediately repeat the excluded example", () => {
  const excluded = exampleRepos[0];
  assert.notEqual(pickExample(() => 0, excluded), excluded);
});

test("excludes the current repo and previous challenger regardless of case", () => {
  const excluded = [exampleRepos[0].toUpperCase(), exampleRepos[1]];
  assert.equal(pickExample(() => 0, excluded), exampleRepos[2]);
});

test("all examples use owner/repo notation", () => {
  for (const repo of exampleRepos) {
    assert.match(repo, /^[\w.-]+\/[\w.-]+$/);
  }
});
