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

export function comparisonStrengths(first, second) {
  const firstSignals = new Map((first.signals || []).map((signal) => [signal.label, signal.passed]));
  const secondSignals = new Map((second.signals || []).map((signal) => [signal.label, signal.passed]));
  const firstOnly = [];
  const secondOnly = [];
  for (const [label, passed] of firstSignals) {
    if (!secondSignals.has(label)) continue;
    if (passed && !secondSignals.get(label)) firstOnly.push(label);
    if (!passed && secondSignals.get(label)) secondOnly.push(label);
  }
  return { firstOnly, secondOnly };
}

export function comparisonText(first, second, permalink) {
  const { verdict } = compareReadings(first, second);
  const { firstOnly, secondOnly } = comparisonStrengths(first, second);
  return [
    `Repo Oracle compared ${first.title} and ${second.title}:`,
    `${first.title}: ${first.score}/100 ${first.scoreTitle}`,
    `${second.title}: ${second.score}/100 ${second.scoreTitle}`,
    verdict,
    ...(firstOnly.length ? [`${first.title} leads on: ${firstOnly.join(", ")}.`] : []),
    ...(secondOnly.length ? [`${second.title} leads on: ${secondOnly.join(", ")}.`] : []),
    `See the comparison: ${permalink}`
  ].join("\n");
}
