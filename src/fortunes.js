const fortuneTiers = [
  {
    name: "blessed",
    minScore: 85,
    personalities: [
      "polished operator with one loose thread left to pull",
      "well-dressed tool that actually brought receipts",
      "repo that greets strangers before asking them to care",
      "star-ready project with only side quests remaining",
      "README overachiever pretending this is casual"
    ],
    roasts: [
      "Annoyingly competent. The oracle had to zoom in to find something to complain about.",
      "This README has receipts, manners, and only one drawer left untidy.",
      "The repo understood the assignment and still left a few points on the table.",
      "Most projects need a rescue plan. This one needs a lint roller."
    ],
    blessings: [
      "The first impression already earns trust; the remaining work is polish, not repair.",
      "Visitors can understand the value quickly, which makes this repo easy to share.",
      "The onboarding is doing real work instead of outsourcing confidence to the code.",
      "This project already feels maintained, legible, and ready for strangers."
    ]
  },
  {
    name: "promising",
    minScore: 70,
    personalities: [
      "useful side quest one strong example away from the main story",
      "serious tool wearing a coat that almost fits",
      "startup MVP learning how to introduce itself",
      "well-built machine waiting for its clearest demo",
      "developer candy with one stubborn wrapper"
    ],
    roasts: [
      "The value is here. It just made visitors bring their own flashlight.",
      "A good repo should not need a witness statement to explain the first screen.",
      "The project has momentum; the README is still tying its shoes.",
      "This is close enough to great that the missing details are now conspicuous."
    ],
    blessings: [
      "The substance is already visible; one focused pass could make it feel finished.",
      "The premise is easy to demonstrate, so the remaining gap is highly fixable.",
      "Most of the trust signals are present and the next improvement is clear.",
      "A sharper first minute could turn casual visitors into actual users."
    ]
  },
  {
    name: "scrappy",
    minScore: 0,
    personalities: [
      "brilliant idea hiding in a README that forgot strangers exist",
      "weekend project with main character energy and no opening credits",
      "useful tool communicating mostly through meaningful silence",
      "startup MVP disguised as a scavenger hunt",
      "developer candy behind a surprisingly locked front door"
    ],
    roasts: [
      "Your repo has the confidence of a framework and the onboarding of a locked door.",
      "This README is giving 'trust me bro' in Markdown form.",
      "The idea is doing push-ups. The presentation is still looking for its shoes.",
      "The README starts like it is already famous. It is not. Help the stranger."
    ],
    blessings: [
      "The foundation is better than the onboarding, which is a fixable problem.",
      "There is a real user pain here; the README just needs to show it faster.",
      "The project can become shareable quickly because the premise has practical value.",
      "A few concrete examples would turn this from mysterious into useful."
    ]
  }
];

const curseBySignal = {
  "Useful repo description": "The code has a purpose, but the GitHub description is making visitors guess it.",
  "Clear install path": "The front door exists, but the install path is making visitors check every handle.",
  "Usage or quickstart": "The quickstart is either missing or too far below the fold.",
  "Visual proof": "No visual proof near the top. Strangers should not have to imagine the product.",
  "Copy-paste command": "The README explains the path but makes visitors assemble the first command themselves.",
  "License": "The repo invites people in without saying what they are allowed to do there.",
  "Three or more topics": "GitHub search has very few clues about who should discover this project.",
  "Updated recently": "The project may be active, but its public pulse is faint.",
  "Concrete examples": "The claims sound plausible, but visitors still have to invent the proof.",
  "Contribution guide": "Potential contributors reach the workshop and find no instructions on the door.",
  "Live demo": "The repo describes the experience without giving visitors a place to try it."
};

// Keep the original exports available while browsers age out cached analyzer modules.
export const personalities = fortuneTiers.flatMap((tier) => tier.personalities);
export const blessings = fortuneTiers.flatMap((tier) => tier.blessings);
export const roasts = fortuneTiers.flatMap((tier) => tier.roasts);
export const curses = [
  curseBySignal["Visual proof"],
  curseBySignal["Live demo"],
  curseBySignal["Usage or quickstart"],
  curseBySignal["Useful repo description"],
  curseBySignal["Copy-paste command"]
];

export function fortuneFor(score, seed) {
  const tier = fortuneTiers.find((candidate) => score >= candidate.minScore);
  return {
    tier: tier.name,
    personality: pick(tier.personalities, seed),
    roast: pick(tier.roasts, seed + 11),
    blessing: pick(tier.blessings, seed + 23)
  };
}

export function curseFor(signalLabel) {
  if (!signalLabel) {
    return "The oracle found no structural curse. Only the dangerous temptation to stop polishing.";
  }
  return curseBySignal[signalLabel];
}

export function pick(list, seed) {
  if (!list.length) return "";
  const index = Math.abs(seed) % list.length;
  return list[index];
}
