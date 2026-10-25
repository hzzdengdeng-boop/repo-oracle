export const exampleRepos = [
  "astral-sh/uv",
  "godotengine/godot",
  "immich-app/immich",
  "neovim/neovim",
  "oven-sh/bun",
  "pocketbase/pocketbase",
  "public-apis/public-apis",
  "sindresorhus/awesome"
];

export function pickExample(random = Math.random, excluded = "") {
  const exclusions = new Set((Array.isArray(excluded) ? excluded : [excluded]).map((repo) => repo.toLowerCase()));
  const choices = exampleRepos.filter((repo) => !exclusions.has(repo.toLowerCase()));
  const index = Math.min(Math.floor(random() * choices.length), choices.length - 1);
  return choices[index];
}
