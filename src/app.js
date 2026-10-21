import { analyze, fetchRepo, parseRepoUrl } from "./analyzer.js?v=20261020";
import { compareReadings, comparisonText } from "./compare.js?v=20261021";
import { pickExample } from "./examples.js";
import { badgeMarkdown, downloadCard, fixPlanMarkdown, shareTextFor } from "./share-card.js?v=20261013";

const form = document.querySelector("#repo-form");
const input = document.querySelector("#repo-url");
const surpriseMe = document.querySelector("#surprise-me");
const score = document.querySelector("#score");
const scoreTitle = document.querySelector("#score-title");
const scoreLabel = document.querySelector("#score-label");
const opportunity = document.querySelector("#opportunity");
const meterFill = document.querySelector("#meter-fill");
const report = document.querySelector("#report");
const moves = document.querySelector("#moves");
const copyPlan = document.querySelector("#copy-plan");
const signals = document.querySelector("#signals");
const scoreMath = document.querySelector("#score-math");
const shareText = document.querySelector("#share-text");
const copyShare = document.querySelector("#copy-share");
const shareReport = document.querySelector("#share-report");
const copyBadge = document.querySelector("#copy-badge");
const downloadCardButton = document.querySelector("#download-card");
const duel = document.querySelector("#duel");
const duelForm = document.querySelector("#duel-form");
const duelInput = document.querySelector("#duel-url");
const duelResult = document.querySelector("#duel-result");
const copyDuel = document.querySelector("#copy-duel");
const compareButton = duelForm.querySelector("button[type='submit']");
const appUrl = "https://hzzdengdeng-boop.github.io/repo-oracle/";

let currentRepo = "";
let currentResult = null;
let opponentRepo = "";
let opponentResult = null;
let lastExample = "";
let readingVersion = 0;
let opponentVersion = 0;
let initialOpponent = new URL(window.location.href).searchParams.get("vs");

surpriseMe.addEventListener("click", () => {
  lastExample = pickExample(Math.random, lastExample);
  input.value = lastExample;
  form.requestSubmit();
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const version = ++readingVersion;
  const opponentFromLink = initialOpponent;
  initialOpponent = null;
  setLoading();
  try {
    const { owner, repo } = parseRepoUrl(input.value);
    const data = await fetchRepo(owner, repo);
    if (version !== readingVersion) return;
    currentRepo = `${owner}/${repo}`;
    const result = analyze(data.meta, data.readme, { readmeOnly: data.readmeOnly });
    render(result);
    updatePermalink(currentRepo);
    if (opponentFromLink) {
      duelInput.value = opponentFromLink;
      await readOpponent(opponentFromLink, version);
    }
  }
  catch (error) {
    if (version === readingVersion) renderError(error);
  }
});

duelForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  await readOpponent(duelInput.value, readingVersion);
});

copyDuel.addEventListener("click", async () => {
  await navigator.clipboard.writeText(comparisonText(currentResult, opponentResult, duelUrl(currentRepo, opponentRepo)));
  copyDuel.textContent = "Copied";
  setTimeout(() => {
    copyDuel.textContent = "Copy comparison";
  }, 1100);
});

copyShare.addEventListener("click", async () => {
  await navigator.clipboard.writeText(shareText.value);
  copyShare.textContent = "Copied";
  setTimeout(() => {
    copyShare.textContent = "Copy text";
  }, 1100);
});

copyBadge.addEventListener("click", async () => {
  await navigator.clipboard.writeText(badgeMarkdown(currentResult, shareUrl(currentRepo)));
  copyBadge.textContent = "Badge copied";
  setTimeout(() => {
    copyBadge.textContent = "Copy badge";
  }, 1100);
});

copyPlan.addEventListener("click", async () => {
  await navigator.clipboard.writeText(fixPlanMarkdown(currentResult, shareUrl(currentRepo)));
  copyPlan.textContent = "Plan copied";
  setTimeout(() => {
    copyPlan.textContent = "Copy fix plan";
  }, 1100);
});

downloadCardButton.addEventListener("click", () => {
  if (currentResult) downloadCard(currentResult, shareUrl(currentRepo));
});

shareReport.addEventListener("click", async () => {
  const url = shareUrl(currentRepo);
  const payload = {
    title: currentRepo ? `Repo Oracle: ${currentRepo}` : "Repo Oracle",
    text: `${currentResult.scoreTitle}: ${currentResult.score}/100. ${currentResult.personality}.`,
    url
  };

  if (navigator.share) {
    await navigator.share(payload);
    return;
  }

  await navigator.clipboard.writeText(url);
  shareReport.textContent = "Link copied";
  setTimeout(() => {
    shareReport.textContent = "Share report";
  }, 1100);
});

function setLoading() {
  currentResult = null;
  resetDuel();
  surpriseMe.disabled = true;
  setShareEnabled(false);
  scoreTitle.textContent = "Star Potential";
  score.textContent = "...";
  scoreLabel.textContent = "Reading the repo's aura.";
  opportunity.innerHTML = "<span>Best next win</span> Calculating the highest-impact fix.";
  meterFill.style.width = "0%";
  report.innerHTML = "<p>Summoning repository fortune...</p>";
  moves.innerHTML = "<li>Reading README...</li>";
  signals.innerHTML = '<li class="signal pending">Checking signals...</li>';
  scoreMath.textContent = "";
}

function render(result) {
  currentResult = result;
  duel.hidden = false;
  surpriseMe.disabled = false;
  setShareEnabled(true);
  scoreTitle.textContent = result.scoreTitle;
  score.textContent = result.score;
  scoreLabel.textContent = result.scoreLabel;
  opportunity.innerHTML = result.opportunity
    ? `<span>Best next win</span><strong>${result.opportunity.gain ? `+${result.opportunity.gain}` : "Score capped"}</strong> ${escapeHtml(result.opportunity.label)}`
    : "<span>Core signals</span><strong>All earned</strong> Time for finer polish.";
  meterFill.style.width = `${result.score}%`;
  report.innerHTML = `
    <p><strong>Repository:</strong> ${escapeHtml(result.title)}</p>
    <p><strong>Personality:</strong> ${escapeHtml(result.personality)}.</p>
    <p><strong>README Roast:</strong> ${escapeHtml(result.roast)}</p>
    <p><strong>Biggest Curse:</strong> ${escapeHtml(result.curse)}</p>
    <p><strong>Hidden Blessing:</strong> ${escapeHtml(result.blessing)}</p>
    <p><strong>Public Signals:</strong> ${result.readmeOnly ? "Unavailable while GitHub API is rate-limited." : `${result.facts.stars} stars, ${result.facts.forks} forks, ${result.facts.openIssues} open issues.`}</p>
  `;
  moves.innerHTML = result.moves.map((move) => `<li>${escapeHtml(move)}</li>`).join("");
  signals.innerHTML = result.signals
    .map(({ label, passed, points }) => `<li class="signal ${passed ? "pass" : "miss"}"><span class="signal-mark" aria-hidden="true">${passed ? "✓" : "×"}</span><span class="signal-label">${escapeHtml(label)}</span><strong class="signal-points">+${points}</strong></li>`)
    .join("");
  const { base, earned, penalties } = result.scoreBreakdown;
  const expression = `${base ? `${base} base + ` : ""}${earned} signals`
    + penalties.map(({ label, points }) => ` - ${points} ${label.toLowerCase()}`).join("");
  const rawScore = base + earned - penalties.reduce((total, penalty) => total + penalty.points, 0);
  scoreMath.textContent = `${rawScore < 0 ? `max(0, ${expression})` : expression} = ${result.score}`;
  shareText.value = shareTextFor(result, shareUrl(currentRepo));
}

function renderError(error) {
  currentResult = null;
  resetDuel();
  surpriseMe.disabled = false;
  setShareEnabled(false);
  scoreTitle.textContent = "Star Potential";
  score.textContent = "--";
  scoreLabel.textContent = "The oracle bumped into a closed door.";
  opportunity.innerHTML = "<span>Best next win</span> No reading yet.";
  meterFill.style.width = "0%";
  report.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  moves.innerHTML = `
    <li>Check that the repository is public.</li>
    <li>Use a URL like https://github.com/owner/repo.</li>
    <li>Try again after GitHub rate limits reset.</li>
  `;
  signals.innerHTML = '<li class="signal pending">No signals available.</li>';
  scoreMath.textContent = "";
}

async function readOpponent(value, version) {
  const attempt = ++opponentVersion;
  opponentRepo = "";
  opponentResult = null;
  copyDuel.hidden = true;
  copyDuel.disabled = true;
  compareButton.disabled = true;
  duelResult.textContent = "Reading the challenger...";
  updatePermalink(currentRepo);
  try {
    const { owner, repo } = parseRepoUrl(value);
    const challenger = `${owner}/${repo}`;
    if (challenger.toLowerCase() === currentRepo.toLowerCase()) {
      throw new Error("Pick a different repository for the duel.");
    }
    const data = await fetchRepo(owner, repo);
    if (version !== readingVersion || attempt !== opponentVersion) return;
    opponentRepo = challenger;
    opponentResult = analyze(data.meta, data.readme, { readmeOnly: data.readmeOnly });
    const { verdict } = compareReadings(currentResult, opponentResult);
    duelResult.innerHTML = `
      <div class="duel-scores">
        <div class="duel-side"><strong>${currentResult.score}</strong><span>${escapeHtml(currentResult.title)}</span><small>${escapeHtml(currentResult.scoreTitle)}</small></div>
        <span class="duel-versus">vs</span>
        <div class="duel-side"><strong>${opponentResult.score}</strong><span>${escapeHtml(opponentResult.title)}</span><small>${escapeHtml(opponentResult.scoreTitle)}</small></div>
      </div>
      <p class="duel-verdict">${escapeHtml(verdict)}</p>
    `;
    updatePermalink(currentRepo, opponentRepo);
    copyDuel.hidden = false;
    copyDuel.disabled = false;
  } catch (error) {
    if (version === readingVersion && attempt === opponentVersion) duelResult.textContent = error.message;
  } finally {
    if (version === readingVersion && attempt === opponentVersion) compareButton.disabled = false;
  }
}

function resetDuel() {
  opponentVersion += 1;
  opponentRepo = "";
  opponentResult = null;
  duel.hidden = true;
  duelInput.value = "";
  duelResult.textContent = "";
  copyDuel.hidden = true;
  copyDuel.disabled = true;
  compareButton.disabled = false;
}

function setShareEnabled(enabled) {
  copyPlan.disabled = !enabled;
  copyShare.disabled = !enabled;
  shareReport.disabled = !enabled;
  copyBadge.disabled = !enabled;
  downloadCardButton.disabled = !enabled;
}

function updatePermalink(repo, opponent = "") {
  const url = new URL(window.location.href);
  url.searchParams.set("repo", repo);
  if (opponent) url.searchParams.set("vs", opponent);
  else url.searchParams.delete("vs");
  window.history.replaceState({}, "", url);
}

function shareUrl(repo) {
  const url = new URL(appUrl);
  url.searchParams.set("repo", repo);
  return url.href;
}

function duelUrl(repo, opponent) {
  const url = new URL(shareUrl(repo));
  url.searchParams.set("vs", opponent);
  return url.href;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const initialRepo = new URL(window.location.href).searchParams.get("repo");
if (initialRepo) {
  input.value = initialRepo;
  form.requestSubmit();
}
