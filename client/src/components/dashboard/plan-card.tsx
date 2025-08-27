import { Plan } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { MoreVertical } from "lucide-react";

interface PlanCardProps {
  plan: Plan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const [, navigate] = useLocation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-chart-1/20 text-chart-1";
      case "completed": return "bg-chart-2/20 text-chart-2";
      case "stopped": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // Calculate estimated progress (simplified - would need day entries for accurate calculation)
  const estimatedProgress = plan.status === "active" ? 37 : plan.status === "completed" ? 100 : 0;
  const estimatedCurrentWager = parseFloat(plan.startWager) * Math.pow(parseFloat(plan.odds), Math.floor(plan.days * (estimatedProgress / 100)));
  const potentialFinal = parseFloat(plan.startWager) * Math.pow(parseFloat(plan.odds), plan.days);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden" data-testid={`plan-card-${plan.id}`}>
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground" data-testid="plan-card-name">
              {plan.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Created {new Date(plan.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(plan.status)} data-testid="plan-card-status">
              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
            </Badge>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Start Wager</p>
            <p className="font-semibold money-text" data-testid="plan-card-start-wager">
              R {parseFloat(plan.startWager).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Odds</p>
            <p className="font-semibold" data-testid="plan-card-odds">
              {parseFloat(plan.odds).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="font-semibold" data-testid="plan-card-duration">
              {plan.days} days
            </p>
          </div>
        </div>
      </div>
      
      {plan.status === "active" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">
              Progress: Day {Math.floor(plan.days * (estimatedProgress / 100))} of {plan.days}
            </span>
            <span className="text-sm text-muted-foreground">{estimatedProgress}% Complete</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="progress-bar h-2 rounded-full" 
              style={{ width: `${estimatedProgress}%` }}
            ></div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Wager</p>
              <p className="text-lg font-bold text-foreground money-text" data-testid="plan-card-current-wager">
                R {estimatedCurrentWager.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Potential Final</p>
              <p className="text-lg font-bold text-chart-1 money-text" data-testid="plan-card-potential-final">
                R {potentialFinal.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button 
              className="flex-1" 
              onClick={() => navigate(`/plans/${plan.id}`)}
              data-testid="button-view-details"
            >
              View Details
            </Button>
            <Button variant="outline" data-testid="button-edit-plan">
              Edit
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
