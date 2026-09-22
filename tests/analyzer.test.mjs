import assert from "node:assert/strict";
import test from "node:test";
import { analyze, fetchRepo } from "../src/analyzer.js";

const meta = {
  description: "A useful repository with a clear public purpose.",
  topics: ["tools", "developer", "github"],
  pushed_at: new Date().toISOString(),
  license: { key: "mit" },
  stargazers_count: 0,
  forks_count: 0,
  open_issues_count: 0
};

const readme = `# Example

![Product screenshot](screenshot.png)

## Install

\`\`\`sh
npm install example
\`\`\`

## Usage

Try this example at https://example.com/demo.

## License

MIT.
`;

test("visual feedback does not contradict a README image", () => {
  for (let index = 0; index < 100; index += 1) {
    const result = analyze({ ...meta, full_name: `owner/repo-${index}` }, readme);
    assert.doesNotMatch(result.curse, /No visual proof/);
    assert.doesNotMatch(result.roast, /screenshot|one demo away/i);
  }
});

test("a missing image remains the top visual issue", () => {
  const result = analyze({ ...meta, full_name: "owner/no-image" }, readme.replace(/!\[[^\]]*\]\([^)]*\)/, ""));
  assert.match(result.curse, /No visual proof/);
});

test("README-only readings do not pretend missing metadata is a repo flaw", () => {
  const result = analyze({ full_name: "owner/limited", topics: [] }, readme, { readmeOnly: true });
  assert.equal(result.scoreTitle, "README Readiness");
  assert.match(result.scoreLabel, /README-only/);
  assert.equal(result.facts.stars, null);
  assert.ok(!result.moves.some((move) => /topics/i.test(move)));
  assert.doesNotMatch(result.curse, /explains its parts/);
});

test("full API readings keep the star-potential label", () => {
  const result = analyze({ ...meta, full_name: "owner/full" }, readme);
  assert.equal(result.scoreTitle, "Star Potential");
  assert.equal(result.facts.stars, 0);
});

test("a rate-limited API falls back to README-only mode", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    if (String(url).startsWith("https://api.github.com/")) return { ok: false };
    if (String(url).endsWith("/main/README.md")) {
      return { ok: true, text: async () => readme };
    }
    return { ok: false };
  };
  try {
    const data = await fetchRepo("owner", "limited");
    assert.equal(data.readmeOnly, true);
    assert.equal(data.readme, readme);
    assert.equal(analyze(data.meta, data.readme, data).scoreTitle, "README Readiness");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("README endpoint failure uses the repository's default branch", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const address = String(url);
    if (address.endsWith("/repos/owner/custom")) {
      return { ok: true, json: async () => ({ ...meta, full_name: "owner/custom", default_branch: "trunk" }) };
    }
    if (address.endsWith("/repos/owner/custom/readme")) throw new Error("API unavailable");
    if (address.endsWith("/trunk/README.md")) {
      return { ok: true, text: async () => readme };
    }
    return { ok: false };
  };
  try {
    const data = await fetchRepo("owner", "custom");
    assert.equal(data.readmeOnly, false);
    assert.equal(data.readme, readme);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("signal summary explains what passed and failed", () => {
  const result = analyze({ ...meta, full_name: "owner/signals" }, readme);
  assert.equal(result.signals.length, 10);
  assert.equal(result.signals.find((signal) => signal.label === "Visual proof").passed, true);
  assert.equal(result.signals.find((signal) => signal.label === "Contribution guide").passed, false);
});

test("README-only signal summary omits unavailable repository metadata", () => {
  const result = analyze({ full_name: "owner/limited" }, readme, { readmeOnly: true });
  assert.equal(result.signals.length, 7);
  assert.ok(!result.signals.some((signal) => signal.label === "Updated recently"));
});

test("next moves stay distinct when a repository passes most checks", () => {
  const completeReadme = `${readme}\n## Contributing\nOpen a pull request.`;
  const result = analyze({ ...meta, full_name: "owner/polished" }, completeReadme);
  assert.equal(new Set(result.moves).size, 3);
});
