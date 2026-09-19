import assert from "node:assert/strict";
import test from "node:test";
import { analyze } from "../src/analyzer.js";

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
