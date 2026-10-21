export function compareReadings(first, second) {
  const comparable = first.readmeOnly === second.readmeOnly;
  const difference = Math.abs(first.score - second.score);
  let verdict;
  if (!comparable) {
    verdict = "Different score modes. No winner declared.";
  } else if (difference === 0) {
    verdict = "It's a tie. The oracle demands a rematch.";
  } else {
    const winner = first.score > second.score ? first : second;
    verdict = `${winner.title} wins by ${difference} point${difference === 1 ? "" : "s"}.`;
  }
  return { comparable, verdict };
}

export function comparisonText(first, second, permalink) {
  const { verdict } = compareReadings(first, second);
  return [
    `Repo Oracle compared ${first.title} and ${second.title}:`,
    `${first.title}: ${first.score}/100 ${first.scoreTitle}`,
    `${second.title}: ${second.score}/100 ${second.scoreTitle}`,
    verdict,
    `See the comparison: ${permalink}`
  ].join("\n");
}
