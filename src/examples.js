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
  const choices = exampleRepos.filter((repo) => repo !== excluded);
  const index = Math.min(Math.floor(random() * choices.length), choices.length - 1);
  return choices[index];
}
