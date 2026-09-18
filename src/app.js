import { analyze, fetchRepo, parseRepoUrl } from "./analyzer.js";

const form = document.querySelector("#repo-form");
const input = document.querySelector("#repo-url");
const score = document.querySelector("#score");
const scoreLabel = document.querySelector("#score-label");
const meterFill = document.querySelector("#meter-fill");
const report = document.querySelector("#report");
const moves = document.querySelector("#moves");
const shareText = document.querySelector("#share-text");
const copyShare = document.querySelector("#copy-share");
const shareReport = document.querySelector("#share-report");

let currentRepo = "";

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoading();
  try {
    const { owner, repo } = parseRepoUrl(input.value);
    currentRepo = `${owner}/${repo}`;
    const data = await fetchRepo(owner, repo);
    const result = analyze(data.meta, data.readme);
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
    copyShare.textContent = "Copy";
  }, 1100);
});

shareReport.addEventListener("click", async () => {
  const url = new URL(window.location.href);
  const payload = {
    title: currentRepo ? `Repo Oracle: ${currentRepo}` : "Repo Oracle",
    text: shareText.value,
    url: url.href
  };

  if (navigator.share) {
    await navigator.share(payload);
    return;
  }

  await navigator.clipboard.writeText(url.href);
  shareReport.textContent = "Link copied";
  setTimeout(() => {
    shareReport.textContent = "Share report";
  }, 1100);
});

function setLoading() {
  score.textContent = "...";
  scoreLabel.textContent = "Reading the repo's aura.";
  meterFill.style.width = "0%";
  report.innerHTML = "<p>Summoning repository fortune...</p>";
  moves.innerHTML = "<li>Reading README...</li>";
}

function render(result) {
  score.textContent = result.score;
  scoreLabel.textContent = result.scoreLabel;
  meterFill.style.width = `${result.score}%`;
  report.innerHTML = `
    <p><strong>Repository:</strong> ${escapeHtml(result.title)}</p>
    <p><strong>Personality:</strong> ${escapeHtml(result.personality)}.</p>
    <p><strong>README Roast:</strong> ${escapeHtml(result.roast)}</p>
    <p><strong>Biggest Curse:</strong> ${escapeHtml(result.curse)}</p>
    <p><strong>Hidden Blessing:</strong> ${escapeHtml(result.blessing)}</p>
    <p><strong>Public Signals:</strong> ${result.facts.stars} stars, ${result.facts.forks} forks, ${result.facts.openIssues} open issues.</p>
  `;
  moves.innerHTML = result.moves.map((move) => `<li>${escapeHtml(move)}</li>`).join("");
  shareText.value = [
    `Repo Oracle read ${result.title}:`,
    `"${result.personality}."`,
    `Star potential: ${result.score}/100`,
    `Biggest curse: ${result.curse}`,
    "Try Repo Oracle: https://github.com/hzzdengdeng-boop/repo-oracle"
  ].join("\n");
}

function renderError(error) {
  score.textContent = "--";
  scoreLabel.textContent = "The oracle bumped into a closed door.";
  meterFill.style.width = "0%";
  report.innerHTML = `<p>${escapeHtml(error.message)}</p>`;
  moves.innerHTML = `
    <li>Check that the repository is public.</li>
    <li>Use a URL like https://github.com/owner/repo.</li>
    <li>Try again after GitHub rate limits reset.</li>
  `;
}

function updatePermalink(repo) {
  const url = new URL(window.location.href);
  url.searchParams.set("repo", repo);
  window.history.replaceState({}, "", url);
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
