import { analyze, fetchRepo, parseRepoUrl } from "./analyzer.js";
import { downloadCard } from "./share-card.js";

const form = document.querySelector("#repo-form");
const input = document.querySelector("#repo-url");
const score = document.querySelector("#score");
const scoreTitle = document.querySelector("#score-title");
const scoreLabel = document.querySelector("#score-label");
const meterFill = document.querySelector("#meter-fill");
const report = document.querySelector("#report");
const moves = document.querySelector("#moves");
const signals = document.querySelector("#signals");
const shareText = document.querySelector("#share-text");
const copyShare = document.querySelector("#copy-share");
const shareReport = document.querySelector("#share-report");
const downloadCardButton = document.querySelector("#download-card");
const appUrl = "https://hzzdengdeng-boop.github.io/repo-oracle/";

let currentRepo = "";
let currentResult = null;

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading();
  try {
    const { owner, repo } = parseRepoUrl(input.value);
    currentRepo = `${owner}/${repo}`;
    const data = await fetchRepo(owner, repo);
    const result = analyze(data.meta, data.readme, { readmeOnly: data.readmeOnly });
    render(result);
    updatePermalink(currentRepo);
  }
  catch (error) {
    renderError(error);
  }
});

copyShare.addEventListener("click", async () => {
  await navigator.clipboard.writeText(shareText.value);
  copyShare.textContent = "Copied";
  setTimeout(() => {
    copyShare.textContent = "Copy text";
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
  setShareEnabled(false);
  scoreTitle.textContent = "Star Potential";
  score.textContent = "...";
  scoreLabel.textContent = "Reading the repo's aura.";
  meterFill.style.width = "0%";
  report.innerHTML = "<p>Summoning repository fortune...</p>";
  moves.innerHTML = "<li>Reading README...</li>";
  signals.innerHTML = '<li class="signal pending">Checking signals...</li>';
}

function render(result) {
  currentResult = result;
  setShareEnabled(true);
  scoreTitle.textContent = result.scoreTitle;
  score.textContent = result.score;
  scoreLabel.textContent = result.scoreLabel;
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
    .map(({ label, passed }) => `<li class="signal ${passed ? "pass" : "miss"}"><span aria-hidden="true">${passed ? "✓" : "×"}</span>${escapeHtml(label)}</li>`)
    .join("");
  shareText.value = [
    `Repo Oracle read ${result.title}:`,
    `"${result.personality}."`,
    `${result.scoreTitle}: ${result.score}/100`,
    ...(result.readmeOnly ? ["GitHub API unavailable; this reading uses the README only."] : []),
    `Biggest curse: ${result.curse}`,
    `Read the report: ${shareUrl(currentRepo)}`
  ].join("\n");
}

function renderError(error) {
  currentResult = null;
  setShareEnabled(false);
  scoreTitle.textContent = "Star Potential";
  score.textContent = "--";
  scoreLabel.textContent = "The oracle bumped into a closed door.";
  meterFill.style.width = "0%";
  report.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  moves.innerHTML = `
    <li>Check that the repository is public.</li>
    <li>Use a URL like https://github.com/owner/repo.</li>
    <li>Try again after GitHub rate limits reset.</li>
  `;
  signals.innerHTML = '<li class="signal pending">No signals available.</li>';
}

function setShareEnabled(enabled) {
  copyShare.disabled = !enabled;
  shareReport.disabled = !enabled;
  downloadCardButton.disabled = !enabled;
}

function updatePermalink(repo) {
  const url = new URL(window.location.href);
  url.searchParams.set("repo", repo);
  window.history.replaceState({}, "", url);
}

function shareUrl(repo) {
  const url = new URL(appUrl);
  url.searchParams.set("repo", repo);
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
