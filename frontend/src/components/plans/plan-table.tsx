import { Plan, DayEntry } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Minus, Edit, RotateCcw, Download, Target, TrendingUp } from "lucide-react";

interface PlanTableProps {
  plan: Plan;
  dayEntries: DayEntry[];
}

export function PlanTable({ plan, dayEntries }: PlanTableProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateDayMutation = useMutation({
    mutationFn: async ({ day, result }: { day: number; result: "win" | "loss" }) => {
      await apiRequest("PATCH", `/api/plans/${plan.id}/days/${day}`, { result });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans", plan.id] });
      toast({
        title: "✅ Day updated",
        description: "Day result has been recorded and plan recalculated.",
        duration: 3000,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleResultToggle = (entry: DayEntry) => {
    if (entry.result === "pending") {
      updateDayMutation.mutate({ day: entry.day, result: "win" });
    } else if (entry.result === "win") {
      updateDayMutation.mutate({ day: entry.day, result: "loss" });
    }
  };

  const getResultButton = (entry: DayEntry) => {
    const baseClass = "w-8 h-8 sm:w-10 sm:h-10 rounded-full transition-all duration-200";
    
    switch (entry.result) {
      case "win":
        return (
          <Button
            size="sm"
            className={`${baseClass} bg-gradient-to-br from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transform hover:scale-105`}
            onClick={() => handleResultToggle(entry)}
            disabled={updateDayMutation.isPending}
            data-testid={`button-result-${entry.day}`}
          >
            <Check className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        );
      case "loss":
        return (
          <Button
            size="sm"
            className={`${baseClass} bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg`}
            disabled
            data-testid={`button-result-${entry.day}`}
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
        );
      case "pending":
        const completedDays = dayEntries.filter(e => e.result === "win").length;
        const isCurrent = entry.day === completedDays + 1;
        
        if (isCurrent) {
          return (
            <Button
              size="sm"
              variant="outline"
              className={`${baseClass} border-2 border-chart-1 bg-chart-1/5 hover:bg-chart-1/10 text-chart-1 shadow-lg hover:shadow-xl transform hover:scale-105 animate-pulse`}
              onClick={() => handleResultToggle(entry)}
              disabled={updateDayMutation.isPending}
              data-testid={`button-result-${entry.day}`}
            >
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          );
        } else {
          return (
            <Button
              size="sm"
              variant="outline"
              className={`${baseClass} border-2 border-muted bg-muted/20 text-muted-foreground opacity-40`}
              disabled
              data-testid={`button-result-${entry.day}`}
            >
              <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          );
        }
      default:
        return null;
    }
  };

  const getRowStyle = (entry: DayEntry) => {
    const completedDays = dayEntries.filter(e => e.result === "win").length;
    const isCurrent = entry.day === completedDays + 1;
    
    if (entry.result === "win") return "bg-green-50/50 dark:bg-green-900/10 border-l-4 border-l-green-500";
    if (isCurrent) return "bg-chart-1/5 border-l-4 border-l-chart-1 shadow-sm";
    if (entry.result === "loss") return "bg-red-50/50 dark:bg-red-900/10 border-l-4 border-l-red-500 opacity-75";
    return "opacity-30 hover:opacity-50 transition-opacity";
  };

  const completedEntries = dayEntries.filter(e => e.result === "win");
  const currentDay = completedEntries.length + 1;

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden shadow-lg">
      {/* Enhanced Header */}
      <div className="p-4 sm:p-6 border-b border-border bg-gradient-to-r from-background to-muted/20">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-chart-1/20 to-chart-1/10 rounded-xl flex items-center justify-center">
                <Target className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center space-x-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Building wealth is a Marathon, not a Sprint</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50" data-testid="button-edit-plan">
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50" data-testid="button-restart-plan">
              <RotateCcw className="h-3 w-3 mr-1" />
              Restart
            </Button>
            <Button className="bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 text-xs" size="sm" data-testid="button-export-plan">
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile-First Table */}
      <div className="overflow-x-auto">
        {/* Mobile Cards View (Hidden on larger screens) */}
        <div className="block sm:hidden">
          <div className="p-4 space-y-3">
            {dayEntries.map((entry) => {
              const completedDays = dayEntries.filter(e => e.result === "win").length;
              const isCurrent = entry.day === completedDays + 1;
              
              return (
                <div 
                  key={entry.id} 
                  className={`p-4 rounded-lg border transition-all duration-200 ${getRowStyle(entry)}`}
                  data-testid={`card-day-${entry.day}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg">Day {entry.day}</span>
                      {isCurrent && <span className="text-xs bg-chart-1 text-white px-2 py-1 rounded-full">CURRENT</span>}
                    </div>
                    {getResultButton(entry)}
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Wager</p>
                      <p className="font-semibold money-text">R {parseFloat(entry.wager).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Odds</p>
                      <p className="font-semibold">{parseFloat(entry.odds).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Winnings</p>
                      <p className="font-semibold text-chart-1 money-text">R {parseFloat(entry.winnings).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Desktop Table View (Hidden on mobile) */}
        <table className="w-full hidden sm:table">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Day
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Wager
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Odds
              </th>
              <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Winnings
              </th>
              <th className="px-4 sm:px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border/50">
            {dayEntries.map((entry) => {
              const completedDays = dayEntries.filter(e => e.result === "win").length;
              const isCurrent = entry.day === completedDays + 1;
              
              return (
                <tr 
                  key={entry.id} 
                  className={`hover:bg-muted/30 transition-all duration-200 ${getRowStyle(entry)}`}
                  data-testid={`row-day-${entry.day}`}
                >
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-foreground">{entry.day}</span>
                      {isCurrent && (
                        <span className="text-xs bg-chart-1 text-white px-2 py-1 rounded-full animate-pulse">
                          CURRENT
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-foreground money-text font-medium">
                    R {parseFloat(entry.wager).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-muted-foreground font-mono">
                    {parseFloat(entry.odds).toFixed(2)}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-semibold text-chart-1 money-text">
                    R {parseFloat(entry.winnings).toLocaleString()}
                  </td>
                  <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-center">
                    {getResultButton(entry)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Enhanced Footer */}
      <div className="p-4 sm:p-6 border-t border-border bg-gradient-to-r from-muted/20 to-muted/10">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-sm"></div>
              <span className="text-muted-foreground">
                Completed ({completedEntries.length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-chart-1 to-chart-1/70 shadow-sm animate-pulse"></div>
              <span className="text-muted-foreground">Current (1)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-muted border-2 border-border"></div>
              <span className="text-muted-foreground">
                Pending ({plan.days - currentDay})
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Last updated: Just now</span>
          </div>
        </div>
      </div>
    </div>
  );
}
