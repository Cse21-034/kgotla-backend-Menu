export function calculateCompoundProgression(
  startWager: number,
  odds: number,
  days: number
): Array<{ day: number; wager: number; winnings: number }> {
  const progression = [];
  let currentWager = startWager;

  for (let day = 1; day <= days; day++) {
    const winnings = currentWager * odds;
    progression.push({
      day,
      wager: currentWager,
      winnings,
    });
    currentWager = winnings;
  }

  return progression;
}

export function formatCurrency(amount: number): string {
  return `R ${amount.toLocaleString()}`;
}

export function calculateWinRate(wins: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

export function calculateProgressPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}
