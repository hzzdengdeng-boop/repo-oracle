import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const index = await readFile(new URL("../index.html", import.meta.url), "utf8");
const robots = await readFile(new URL("../robots.txt", import.meta.url), "utf8");
const sitemap = await readFile(new URL("../sitemap.xml", import.meta.url), "utf8");

test("publishes a large social preview with useful alt text", () => {
  assert.match(index, /property="og:image"/);
  assert.match(index, /property="og:image:width" content="1200"/);
  assert.match(index, /property="og:image:height" content="630"/);
  assert.match(index, /property="og:image:alt" content="[^"]+"/);
  assert.match(index, /name="twitter:card" content="summary_large_image"/);
});

test("declares one canonical public URL", () => {
  const canonical = "https://hzzdengdeng-boop.github.io/repo-oracle/";
  assert.match(index, new RegExp(`<link rel="canonical" href="${canonical}"`));
  assert.match(index, new RegExp(`"url": "${canonical}"`));
  assert.match(sitemap, new RegExp(`<loc>${canonical}</loc>`));
  assert.match(robots, /Sitemap: https:\/\/hzzdengdeng-boop\.github\.io\/repo-oracle\/sitemap\.xml/);
});

test("describes Repo Oracle as a free developer web app", () => {
  assert.match(index, /"@type": "WebApplication"/);
  assert.match(index, /"applicationCategory": "DeveloperApplication"/);
  assert.match(index, /"isAccessibleForFree": true/);
});
