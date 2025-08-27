import { Plan, DayEntry } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Clock, Minus } from "lucide-react";

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
        title: "Day updated",
        description: "Day result has been recorded and plan recalculated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
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
    // Loss entries cannot be toggled back (plan is stopped)
  };

  const getResultButton = (entry: DayEntry) => {
    const baseClass = "w-8 h-8 rounded-full transition-colors";
    
    switch (entry.result) {
      case "win":
        return (
          <Button
            size="sm"
            className={`${baseClass} bg-chart-1 text-white hover:bg-chart-1/80`}
            onClick={() => handleResultToggle(entry)}
            disabled={updateDayMutation.isPending}
            data-testid={`button-result-${entry.day}`}
          >
            <Check className="h-4 w-4" />
          </Button>
        );
      case "loss":
        return (
          <Button
            size="sm"
            className={`${baseClass} bg-destructive text-white`}
            disabled
            data-testid={`button-result-${entry.day}`}
          >
            <X className="h-4 w-4" />
          </Button>
        );
      case "pending":
        // Determine if this is the current day (first pending after all wins)
        const completedDays = dayEntries.filter(e => e.result === "win").length;
        const isCurrent = entry.day === completedDays + 1;
        
        if (isCurrent) {
          return (
            <Button
              size="sm"
              variant="outline"
              className={`${baseClass} border-2 border-border hover:bg-muted/80`}
              onClick={() => handleResultToggle(entry)}
              disabled={updateDayMutation.isPending}
              data-testid={`button-result-${entry.day}`}
            >
              <Clock className="h-4 w-4" />
            </Button>
          );
        } else {
          return (
            <Button
              size="sm"
              variant="outline"
              className={`${baseClass} border-2 border-border opacity-50`}
              disabled
              data-testid={`button-result-${entry.day}`}
            >
              <Minus className="h-4 w-4" />
            </Button>
          );
        }
      default:
        return null;
    }
  };

  const getRowOpacity = (entry: DayEntry) => {
    const completedDays = dayEntries.filter(e => e.result === "win").length;
    const isCurrent = entry.day === completedDays + 1;
    
    if (entry.result === "win") return "";
    if (isCurrent) return "";
    if (entry.result === "loss") return "opacity-75";
    return "opacity-25";
  };

  const completedEntries = dayEntries.filter(e => e.result === "win");
  const currentDay = completedEntries.length + 1;

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {plan.name} - Detailed View
            </h3>
            <p className="text-sm text-muted-foreground">
              Building wealth is a Marathon, not a Sprint
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button variant="outline" size="sm" data-testid="button-edit-plan">
              Edit Plan
            </Button>
            <Button variant="outline" size="sm" data-testid="button-restart-plan">
              Restart from Day
            </Button>
            <Button className="bg-chart-1 hover:bg-chart-1/90" size="sm" data-testid="button-export-plan">
              Export
            </Button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Day
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Wager
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Odds
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Winnings
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Result
              </th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {dayEntries.map((entry) => (
              <tr 
                key={entry.id} 
                className={`hover:bg-muted/50 transition-colors ${getRowOpacity(entry)}`}
                data-testid={`row-day-${entry.day}`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {entry.day}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground money-text">
                  R {parseFloat(entry.wager).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {parseFloat(entry.odds).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-chart-1 money-text">
                  R {parseFloat(entry.winnings).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getResultButton(entry)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="p-6 border-t border-border bg-muted/30">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-chart-1"></div>
              <span className="text-muted-foreground">
                Completed ({completedEntries.length})
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-accent"></div>
              <span className="text-muted-foreground">Current (1)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-muted border-2 border-border"></div>
              <span className="text-muted-foreground">
                Pending ({plan.days - currentDay})
              </span>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 text-sm text-muted-foreground">
            Last updated: Just now
          </div>
        </div>
      </div>
    </div>
  );
}
