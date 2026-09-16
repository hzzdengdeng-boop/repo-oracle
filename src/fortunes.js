export const personalities = [
  "brilliant idea hiding in a README that forgot strangers exist",
  "serious tool wearing a surprisingly boring coat",
  "weekend project with main character energy",
  "useful side quest that needs a stronger opening scene",
  "startup MVP disguised as a humble repository",
  "well-built machine waiting for a demo GIF to prove it",
  "developer candy with a slightly locked front door",
  "tiny dragon hoarding practical value under vague wording"
];

export const blessings = [
  "The repo already has enough substance to earn trust once the first screen is clearer.",
  "The project can become shareable quickly because the premise is easy to demonstrate.",
  "There is a real user pain here; the README just needs to show it faster.",
  "The foundation is better than the onboarding, which is a fixable problem.",
  "A few examples would turn this from interesting into immediately useful."
];

export const curses = [
  "No visual proof near the top. Strangers should not have to imagine the product.",
  "The README asks for patience before it earns attention.",
  "The quickstart is either missing or too far below the fold.",
  "The project explains its parts before selling the outcome.",
  "The repo may be useful, but the first impression is making people work for it."
];

export const roasts = [
  "Your repo has the confidence of a framework and the onboarding of a locked door.",
  "This README is giving 'trust me bro' in Markdown form.",
  "The idea is doing push-ups. The presentation is still looking for its shoes.",
  "A screenshot would do more here than three paragraphs of noble ambition.",
  "The project might be great, but the first screen is whispering into a pillow.",
  "This repo is one demo away from being understood by humans.",
  "The README starts like it is already famous. It is not. Help the stranger."
];

export function pick(list, seed) {
  if (!list.length) return "";
  const index = Math.abs(seed) % list.length;
  return list[index];
}
