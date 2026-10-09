import assert from "node:assert/strict";
import test from "node:test";
import { badgeMarkdown, fixPlanMarkdown } from "../src/share-card.js";

test("badge markdown links the score to the report", () => {
  const permalink = "https://example.com/?repo=owner%2Frepo";
  const markdown = badgeMarkdown({ score: 91, readmeOnly: false }, permalink);
  assert.match(markdown, /Repo%20Oracle-91%2F100-1f7a68/);
  assert.ok(markdown.endsWith(`](${permalink})`));
});

test("README-only badges say what they measure", () => {
  const markdown = badgeMarkdown({ score: 62, readmeOnly: true }, "https://example.com/");
  assert.match(markdown, /README%20Readiness-62%2F100-d55c3f/);
  assert.match(markdown, /README Readiness: 62\/100/);
});

test("fix plan markdown is ready for a GitHub issue", () => {
  const permalink = "https://example.com/?repo=owner%2Frepo";
  const markdown = fixPlanMarkdown({
    title: "owner/repo",
    scoreTitle: "Star Potential",
    score: 68,
    moves: ["Add a quickstart.", "Show a screenshot.", "Add repository topics."]
  }, permalink);

  assert.match(markdown, /^## Repo Oracle fix plan for `owner\/repo`/);
  assert.match(markdown, /Current star potential: \*\*68\/100\*\*/);
  assert.equal((markdown.match(/- \[ \]/g) || []).length, 3);
  assert.ok(markdown.endsWith(`[View the full Repo Oracle report](${permalink})`));
});
