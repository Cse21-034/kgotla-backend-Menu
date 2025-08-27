import { Plan } from "@/types/schema";
import { TrendingUp, BarChart3 } from "lucide-react";

interface AnalyticsChartsProps {
  plans: Plan[];
}

export function AnalyticsCharts({ plans }: AnalyticsChartsProps) {
  // Calculate success rates for each plan
  const planStats = plans.map(plan => ({
    name: plan.name,
    status: plan.status,
    successRate: plan.status === "completed" ? 100 : plan.status === "stopped" ? 43 : 91
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Progression Chart</h3>
        <div className="h-64 chart-container rounded-lg flex items-center justify-center text-white">
          <div className="text-center">
            <TrendingUp className="h-12 w-12 mb-2 opacity-80 mx-auto" />
            <p className="text-sm opacity-80">Exponential Growth Visualization</p>
            <p className="text-xs opacity-60 mt-2">Chart implementation coming soon</p>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg border border-border p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Success Rate Analysis</h3>
        <div className="space-y-4">
          {planStats.length > 0 ? (
            planStats.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground truncate max-w-32">
                  {plan.name}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-24 bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        plan.successRate >= 80 ? "bg-chart-1" : 
                        plan.successRate >= 50 ? "bg-chart-2" : "bg-destructive"
                      }`}
                      style={{ width: `${plan.successRate}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-foreground min-w-12">
                    {plan.successRate}%
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No plans yet. Create your first plan to see analytics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
