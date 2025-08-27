import { Plan, DayEntry } from "../schema";

export function generatePlanEntries(plan: Plan): Omit<DayEntry, "id">[] {
  const entries: Omit<DayEntry, "id">[] = [];
  let currentWager = parseFloat(plan.startWager);
  const odds = parseFloat(plan.odds);

  for (let day = 1; day <= plan.days; day++) {
    const winnings = currentWager * odds;
    
    entries.push({
      planId: plan.id,
      day,
      wager: currentWager.toString(),
      odds: plan.odds,
      winnings: winnings.toString(),
      result: "pending"
    });

    currentWager = winnings;
  }

  return entries;
}

export function recalculatePlanFromDay(plan: Plan, fromDay: number): Omit<DayEntry, "id">[] {
  const entries: Omit<DayEntry, "id">[] = [];
  
  // Calculate wager for the restart day based on previous wins
  let currentWager = parseFloat(plan.startWager);
  const odds = parseFloat(plan.odds);
  
  // Build up to the restart day
  for (let day = 1; day < fromDay; day++) {
    currentWager = currentWager * odds;
  }

  // Generate entries from restart day onwards
  for (let day = fromDay; day <= plan.days; day++) {
    const winnings = currentWager * odds;
    
    entries.push({
      planId: plan.id,
      day,
      wager: currentWager.toString(),
      odds: plan.odds,
      winnings: winnings.toString(),
      result: "pending"
    });

    currentWager = winnings;
  }

  return entries;
}

export function calculatePlanStats(plan: Plan, dayEntries: DayEntry[]) {
  const completedEntries = dayEntries.filter(entry => entry.result !== "pending");
  const winningEntries = dayEntries.filter(entry => entry.result === "win");
  const currentDay = completedEntries.length + 1;
  const progressPercentage = Math.round((completedEntries.length / plan.days) * 100);
  
  const currentEntry = dayEntries.find(entry => entry.day === currentDay);
  const currentWager = currentEntry ? parseFloat(currentEntry.wager) : 0;
  
  const finalEntry = dayEntries[dayEntries.length - 1];
  const potentialFinal = finalEntry ? parseFloat(finalEntry.winnings) : 0;
  
  const winRate = completedEntries.length > 0 
    ? Math.round((winningEntries.length / completedEntries.length) * 100) 
    : 0;

  return {
    currentDay,
    progressPercentage,
    currentWager,
    potentialFinal,
    winRate,
    completedDays: completedEntries.length,
    totalDays: plan.days
  };
}