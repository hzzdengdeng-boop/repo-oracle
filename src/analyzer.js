import { blessings, curses, personalities, pick, roasts } from "./fortunes.js";

const sectionPatterns = {
  install: /\b(install|installation|setup|get started|getting started)\b/i,
  usage: /\b(usage|example|examples|quickstart|quick start|demo)\b/i,
  license: /\blicense\b/i,
  contribute: /\b(contributing|contribute|development)\b/i,
  screenshot: /!\[[^\]]*\]\([^)]+\)|\b(screenshot|gif|demo video|preview)\b/i,
  badge: /\[!\[[^\]]*\]\([^)]+\)\]\([^)]+\)/,
  command: /```[\s\S]*?\b(npm|pnpm|yarn|pip|uv|cargo|go install|docker|npx)\b[\s\S]*?```/i
};

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
	const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
	if (!repoRes.ok) {
		const fallbackReadme = await fetchReadmeFallback(owner, repo);
		if (!fallbackReadme) {
			throw new Error(`GitHub could not read ${owner}/${repo}. The API may be rate-limited, or the repo may be private.`);
		}
		return {
			meta: {
				full_name: `${owner}/${repo}`,
				description: "",
				topics: [],
				stargazers_count: "?",
				forks_count: "?",
				open_issues_count: "?",
				pushed_at: null,
				license: null
			},
			readme: fallbackReadme
		};
	}
	const meta = await repoRes.json();

  let readme = "";
  const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
  if (readmeRes.ok) {
    const readmeMeta = await readmeRes.json();
    const raw = await fetch(readmeMeta.download_url);
    if (raw.ok) readme = await raw.text();
	}
	return { meta, readme };
}

async function fetchReadmeFallback(owner, repo) {
	const branches = ["main", "master", "canary", "develop"];
	const names = ["README.md", "readme.md", "README"];
	for (const branch of branches) {
		for (const name of names) {
			const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${name}`;
			const res = await fetch(url);
			if (res.ok) return res.text();
		}
	}
	return "";
}

export function analyze(meta, readme) {
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

  let score = 15;
  if (checks.hasDescription) score += 12;
  if (checks.hasInstall) score += 10;
  if (checks.hasUsage) score += 11;
  if (checks.hasScreenshot) score += 12;
  if (checks.hasCommand) score += 8;
  if (checks.hasLicense) score += 7;
  if (checks.hasTopics) score += 8;
  if (checks.hasRecentUpdate) score += 7;
  if (checks.hasExamples) score += 5;
  if (checks.hasContributing) score += 3;
  if (checks.hasDemoLink) score += 7;

  if (readme.length < 700) score -= 10;
  if ((lower.match(/badge/g) || []).length > 8) score -= 5;
  if (!description) score -= 8;
  score = Math.max(0, Math.min(100, score));

  return {
    title,
    description,
    score,
    scoreLabel: labelFor(score),
    personality: pick(personalities, seed),
    roast: pick(roasts, seed + 11),
    curse: chooseCurse(checks, seed),
    blessing: pick(blessings, seed + 23),
    moves: nextMoves(checks),
    facts: {
      stars: meta.stargazers_count,
      forks: meta.forks_count,
      openIssues: meta.open_issues_count,
      topics,
      updated: meta.pushed_at
    }
  };
}

function chooseCurse(checks, seed) {
  if (!checks.hasScreenshot) return curses[0];
  if (!checks.hasUsage) return curses[2];
  if (!checks.hasDescription) return curses[3];
  return pick(curses, seed + 17);
}

function nextMoves(checks) {
  const moves = [];
  if (!checks.hasScreenshot) moves.push("Add a screenshot, GIF, or live demo above the fold.");
  if (!checks.hasUsage) moves.push("Add a 30-second quickstart with one copy-paste example.");
  if (!checks.hasInstall) moves.push("Add install/setup steps before the feature list.");
  if (!checks.hasTopics) moves.push("Add GitHub topics so people can discover it in search.");
  if (!checks.hasDemoLink) moves.push("Add a live demo or examples page people can share.");
  if (!checks.hasLicense) moves.push("Add a license so strangers know they can use it.");
  if (!checks.hasContributing) moves.push("Add a short contribution section for drive-by improvements.");
  while (moves.length < 3) {
    moves.push("Move the clearest value proposition into the first 5 lines of the README.");
  }
  return moves.slice(0, 3);
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
