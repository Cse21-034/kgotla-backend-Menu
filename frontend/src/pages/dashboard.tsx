// pages/dashboard.tsx
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PlanCard } from "@/components/dashboard/plan-card";
import { CreatePlanForm } from "@/components/dashboard/create-plan-form";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { usePlans } from "@/hooks/use-plans";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Dashboard() {
  const { data, isLoading } = usePlans();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ensure plans is an array
  const plansArray = Array.isArray(data?.plans) ? data.plans : [];
  const activePlans = plansArray.filter((plan: any) => plan.status === "active");
  const completedPlans = plansArray.filter((plan: any) => plan.status === "completed");
  const stoppedPlans = plansArray.filter((plan: any) => plan.status === "stopped");

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">Dashboard</h1>
          <p className="text-muted-foreground">Track your compound betting progressions</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mt-4 sm:mt-0"
          data-testid="button-create-plan"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards plans={plansArray} />

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Plans */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground">Active Plans</h2>
          {activePlans.length > 0 ? (
            activePlans.map((plan: any) => (
              <PlanCard key={plan.id} plan={plan} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No active plans. Create your first plan to get started!</p>
            </div>
          )}
        </div>

        {/* Create Plan Form */}
        <div className="sticky top-24">
          {showCreateForm ? (
            <CreatePlanForm onSuccess={() => setShowCreateForm(false)} />
          ) : (
            <div className="bg-card rounded-lg border border-border p-6 text-center">
              <p className="text-muted-foreground mb-4">Ready to start a new betting marathon?</p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                variant="outline"
                data-testid="button-show-create-form"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Plan
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Analytics */}
      <AnalyticsCharts plans={plansArray} />
    </div>
  );
}
