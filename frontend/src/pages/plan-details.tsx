// pages/plan-details.tsx
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PlanTable } from "@/components/plans/plan-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, RotateCcw, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Plan, DayEntry } from "@/types/schema";

interface PlanDetailsResponse {
  plan: Plan;
  dayEntries: DayEntry[];
}

export default function PlanDetails() {
  const { id } = useParams();
  const [, navigate ] = useLocation();

  const { data, isLoading, error } = useQuery<PlanDetailsResponse>({
    queryKey: ["/api/plans", id],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/plans/${id}`);
      if (response.status === 401) {
        localStorage.removeItem('jwt_token');
        navigate("/login");
        return null;
      }
      return response.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-6 w-full max-w-3xl px-4">
          <div className="h-8 bg-muted rounded w-full"></div>
          <div className="h-64 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-destructive">Failed to load plan details</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { plan, dayEntries } = data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-chart-1/20 text-chart-1";
      case "completed": return "bg-chart-2/20 text-chart-2";
      case "stopped": return "bg-destructive/20 text-destructive";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Banner Ad - Top */}
      <div className="bg-accent text-center py-2 text-sm text-accent-foreground">
        <p>Advertisement Banner Here</p> 
        {/* Integrate ad script or image here */}
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-foreground" data-testid="plan-name">
                {plan.name}
              </h1>
              <Badge className={getStatusColor(plan.status)} data-testid="plan-status">
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Created {new Date(plan.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" data-testid="button-edit">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" data-testid="button-restart">
              <RotateCcw className="h-4 w-4 mr-2" />
              Restart
            </Button>
            <Button variant="outline" size="sm" data-testid="button-export">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Plan Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Start Wager</p>
            <p className="text-lg font-semibold money-text" data-testid="stat-start-wager">
              R {parseFloat(plan.startWager).toLocaleString()}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Odds</p>
            <p className="text-lg font-semibold" data-testid="stat-odds">
              {parseFloat(plan.odds).toFixed(2)}
            </p>
          </div>
          <div className="bg-card rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-lg font-semibold" data-testid="stat-duration">
              {plan.days} days
            </p>
          </div>
        </div>

        {/* Plan Table */}
        <PlanTable plan={plan} dayEntries={dayEntries} />

        {/* Sidebar Ad - Side Banner */}
        <div className="bg-accent text-center py-4 rounded-lg border border-accent text-accent-foreground mt-6">
          <p>Sidebar Advertisement Here</p>
          {/* Integrate ad script or image here */}
        </div>

        {/* Bottom Banner Ad */}
        <div className="bg-accent text-center py-4 text-sm text-accent-foreground rounded-lg border border-accent mt-6">
          <p>Bottom Advertisement Banner Here</p>
          {/* Integrate ad script or image here */}
        </div>
      </div>
    </div>
  );
}
