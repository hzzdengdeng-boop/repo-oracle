import { curseFor, fortuneFor } from "./fortunes.js?v=20261010";

const sectionPatterns = {
  install: /\b(install|installation|setup|get started|getting started)\b/i,
  usage: /\b(usage|example|examples|quickstart|quick start|demo)\b/i,
  license: /\blicense\b/i,
  contribute: /\b(contributing|contribute|development)\b/i,
  screenshot: /!\[[^\]]*\]\([^)]+\)|\b(screenshot|gif|demo video|preview)\b/i,
  badge: /\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/,
  command: /```[\s\S]*?\b(npm|pnpm|yarn|pip|uv|cargo|go install|docker|npx)\b[\s\S]*?```/i
};

const signalDefinitions = [
  { key: "hasDescription", label: "Useful repo description", fullPoints: 12, move: "Write a concrete GitHub description that names the user and outcome." },
  { key: "hasInstall", label: "Clear install path", fullPoints: 10, readmePoints: 16, move: "Add install/setup steps before the feature list." },
  { key: "hasUsage", label: "Usage or quickstart", fullPoints: 11, readmePoints: 20, move: "Add a 30-second quickstart with one copy-paste example." },
  { key: "hasScreenshot", label: "Visual proof", fullPoints: 12, readmePoints: 16, move: "Add a screenshot, GIF, or live demo above the fold." },
  { key: "hasCommand", label: "Copy-paste command", fullPoints: 8, readmePoints: 10, move: "Give visitors one command they can copy and run immediately." },
  { key: "hasLicense", label: "License", fullPoints: 7, readmePoints: 8, move: "Add a license so strangers know they can use it." },
  { key: "hasTopics", label: "Three or more topics", fullPoints: 8, move: "Add GitHub topics so people can discover it in search." },
  { key: "hasRecentUpdate", label: "Updated recently", fullPoints: 7, move: "Ship or document one small update to show the project is active." },
  { key: "hasExamples", label: "Concrete examples", fullPoints: 5, readmePoints: 8, move: "Add one concrete input-and-output example." },
  { key: "hasContributing", label: "Contribution guide", fullPoints: 3, readmePoints: 7, move: "Add a short contribution section for drive-by improvements." },
  { key: "hasDemoLink", label: "Live demo", fullPoints: 7, readmePoints: 15, move: "Add a live demo or examples page people can share." }
];

export function parseRepoUrl(value) {
  const trimmed = value.trim();
  const match = trimmed.match(/github\.com\/([^/\s]+)\/([^/#?\s]+)/i)
    || trimmed.match(/^([^/\s]+)\/([^/#?\s]+)$/);
  if (!match) {
    throw new Error("Use a GitHub URL like https://github.com/owner/repo");
  }
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, "")
  };
}

export async function fetchRepo(owner, repo) {
  const headers = { Accept: "application/vnd.github+json" };
  const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers }).catch(() => null);
  if (!repoRes?.ok) {
    const fallbackReadme = await fetchReadmeFallback(owner, repo);
    if (!fallbackReadme) {
      throw new Error(`GitHub could not read ${owner}/${repo}. The API may be rate-limited, or the repo may be private.`);
    }
    return {
      meta: { full_name: `${owner}/${repo}` },
      readme: fallbackReadme,
      readmeOnly: true
    };
  }
  const meta = await repoRes.json();

  let readme = "";
  const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers }).catch(() => null);
  if (readmeRes?.ok) {
    const readmeMeta = await readmeRes.json();
    if (readmeMeta.download_url) {
      const raw = await fetch(readmeMeta.download_url).catch(() => null);
      if (raw?.ok) readme = await raw.text();
    }
  }
  if (!readme) readme = await fetchReadmeFallback(owner, repo, meta.default_branch);
  return { meta, readme, readmeOnly: false };
}

async function fetchReadmeFallback(owner, repo, defaultBranch) {
  const branches = [...new Set([defaultBranch, "main", "master", "canary", "develop"].filter(Boolean))];
  const names = ["README.md", "readme.md", "README"];
  for (const branch of branches) {
    for (const name of names) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${name}`;
      const res = await fetch(url).catch(() => null);
      if (res?.ok) return res.text();
    }
  }
  return "";
}

export function analyze(meta, readme, { readmeOnly = false } = {}) {
  const title = meta.full_name;
  const description = meta.description || "";
  const topics = meta.topics || [];
  const seed = hash(`${title}${description}${readme.slice(0, 400)}`);
  const lower = readme.toLowerCase();
  const checks = {
    hasDescription: description.length >= 20,
    hasInstall: sectionPatterns.install.test(readme),
    hasUsage: sectionPatterns.usage.test(readme),
    hasScreenshot: sectionPatterns.screenshot.test(readme),
    hasCommand: sectionPatterns.command.test(readme),
    hasLicense: Boolean(meta.license) || sectionPatterns.license.test(readme),
    hasTopics: topics.length >= 3,
    hasRecentUpdate: daysSince(meta.pushed_at) <= 45,
    hasExamples: /\bexamples?\b/i.test(readme),
    hasContributing: sectionPatterns.contribute.test(readme),
    hasDemoLink: /\b(demo|playground|try it|live)\b/i.test(readme) && /https?:\/\//.test(readme)
  };

  const signals = signalSummary(checks, readmeOnly);
  let score = readmeOnly ? 0 : 15;
  score += signals
    .filter((signal) => signal.passed)
    .reduce((total, signal) => total + signal.points, 0);
  if (!readmeOnly) {
    if (readme.length < 700) score -= 10;
    if (!description) score -= 8;
  }

  if ((lower.match(/badge/g) || []).length > 8) score -= 5;
  score = Math.max(0, Math.min(100, score));
  const opportunity = bestOpportunity(signals, score);
  const fortune = fortuneFor(score, seed);

  return {
    title,
    description,
    score,
    scoreTitle: readmeOnly ? "README Readiness" : "Star Potential",
    scoreLabel: readmeOnly ? "README-only reading. GitHub API data is unavailable." : labelFor(score),
    personality: fortune.personality,
    roast: fortune.roast,
    curse: curseFor(opportunity?.label),
    blessing: fortune.blessing,
    fortuneTier: fortune.tier,
    moves: nextMoves(signals),
    signals,
    opportunity,
    readmeOnly,
    facts: {
      stars: readmeOnly ? null : meta.stargazers_count,
      forks: readmeOnly ? null : meta.forks_count,
      openIssues: readmeOnly ? null : meta.open_issues_count,
      topics,
      updated: meta.pushed_at
    }
  };
}

function signalSummary(checks, readmeOnly) {
  return signalDefinitions
    .filter((signal) => !readmeOnly || signal.readmePoints != null)
    .map((signal) => ({
      label: signal.label,
      passed: checks[signal.key],
      points: readmeOnly ? signal.readmePoints : signal.fullPoints,
      move: signal.move
    }));
}

function nextMoves(signals) {
  const moves = [...signals]
    .filter((signal) => !signal.passed)
    .sort((a, b) => b.points - a.points)
    .map((signal) => signal.move);
  const polishMoves = [
    "Move the clearest value proposition into the first 5 lines of the README.",
    "Replace one vague claim with a concrete result or example.",
    "Ask a new user to try the quickstart and fix the first point of friction."
  ];
  while (moves.length < 3) {
    moves.push(polishMoves.find((move) => !moves.includes(move)));
  }
  return moves.slice(0, 3);
}

function bestOpportunity(signals, score) {
  const missing = [...signals]
    .filter((signal) => !signal.passed)
    .sort((a, b) => b.points - a.points);
  if (!missing.length) return null;
  return {
    label: missing[0].label,
    points: missing[0].points,
    gain: Math.min(missing[0].points, 100 - score)
  };
}

function labelFor(score) {
  if (score >= 85) return "Blessed. This repo knows how to greet strangers.";
  if (score >= 70) return "Promising. A few presentation fixes could move it fast.";
  if (score >= 50) return "Readable, but not yet irresistible.";
  return "The idea may be alive, but the onboarding needs a lantern.";
}

function daysSince(date) {
  if (!date) return Infinity;
  return (Date.now() - new Date(date).getTime()) / 86400000;
}

function hash(input) {
  let value = 0;
  for (let i = 0; i < input.length; i += 1) {
    value = (value << 5) - value + input.charCodeAt(i);
    value |= 0;
  }
  return value;
}
