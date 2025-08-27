import { Plan } from "@shared/schema";
import { Play, Coins, Trophy, Percent } from "lucide-react";

interface StatsCardsProps {
  plans: Plan[];
}

export function StatsCards({ plans }: StatsCardsProps) {
  const activePlans = plans.filter(plan => plan.status === "active");
  const totalInvestment = plans.reduce((sum, plan) => sum + parseFloat(plan.startWager), 0);
  
  // Calculate potential winnings for active plans (simplified - would need day entries for accurate calculation)
  const potentialWinnings = activePlans.reduce((sum, plan) => {
    const finalWinnings = parseFloat(plan.startWager) * Math.pow(parseFloat(plan.odds), plan.days);
    return sum + finalWinnings;
  }, 0);

  const completedPlans = plans.filter(plan => plan.status === "completed");
  const winRate = plans.length > 0 ? Math.round((completedPlans.length / plans.length) * 100) : 0;

  const statsData = [
    {
      title: "Active Plans",
      value: activePlans.length.toString(),
      icon: Play,
      color: "text-chart-1",
      bgColor: "bg-chart-1/20",
    },
    {
      title: "Total Investment",
      value: `R ${totalInvestment.toLocaleString()}`,
      icon: Coins,
      color: "text-chart-2",
      bgColor: "bg-chart-2/20",
    },
    {
      title: "Potential Winnings",
      value: `R ${potentialWinnings.toLocaleString()}`,
      icon: Trophy,
      color: "text-chart-1",
      bgColor: "bg-chart-1/20",
    },
    {
      title: "Win Rate",
      value: `${winRate}%`,
      icon: Percent,
      color: "text-chart-3",
      bgColor: "bg-chart-3/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-card rounded-lg border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
              <p className={`text-2xl font-bold money-text ${
                stat.title.includes("Winnings") ? stat.color : "text-foreground"
              }`} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, "-")}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`${stat.color} h-5 w-5`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
