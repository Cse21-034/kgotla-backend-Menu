// pages/plan-details.tsx
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PlanTable } from "@/components/plans/plan-table";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, RotateCcw, Download, Target, Calendar, TrendingUp, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Plan, DayEntry } from "@/types/schema";

interface PlanDetailsResponse {
  plan: Plan;
  dayEntries: DayEntry[];
}

export default function PlanDetails() {
  const { id } = useParams();
  const [, navigate] = useLocation();

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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="animate-pulse space-y-4 sm:space-y-6">
            {/* Header Skeleton */}
            <div className="flex items-center gap-4">
              <div className="h-8 w-16 bg-muted rounded"></div>
              <div className="h-8 bg-muted rounded w-1/3"></div>
              <div className="ml-auto flex gap-2">
                <div className="h-8 w-16 bg-muted rounded"></div>
                <div className="h-8 w-20 bg-muted rounded"></div>
                <div className="h-8 w-18 bg-muted rounded"></div>
              </div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-muted rounded-lg"></div>
              ))}
            </div>
            
            {/* Table Skeleton */}
            <div className="h-96 bg-muted rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Plan Not Found</h2>
            <p className="text-destructive mb-6">Failed to load plan details. The plan may have been deleted or you don't have access.</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-chart-1 to-chart-1/80">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { plan, dayEntries } = data;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active": 
        return {
          color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
          icon: "🟢",
          gradient: "from-green-500/10 to-green-500/5"
        };
      case "completed": 
        return {
          color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
          icon: "✅",
          gradient: "from-blue-500/10 to-blue-500/5"
        };
      case "stopped": 
        return {
          color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
          icon: "🔴",
          gradient: "from-red-500/10 to-red-500/5"
        };
      default: 
        return {
          color: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30",
          icon: "⚪",
          gradient: "from-gray-500/10 to-gray-500/5"
        };
    }
  };

  const statusConfig = getStatusConfig(plan.status);
  const completedDays = dayEntries.filter(e => e.result === "win").length;
  const currentWager = dayEntries.find(e => e.day === completedDays + 1)?.wager || plan.startWager;
  const potentialFinal = parseFloat(plan.startWager) * Math.pow(parseFloat(plan.odds), plan.days);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Enhanced Back Button & Header */}
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/")}
            className="w-fit hover:bg-muted/50 transition-all duration-200"
            data-testid="button-back"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground truncate" data-testid="plan-name">
                {plan.name}
              </h1>
              <Badge className={`${statusConfig.color} text-sm px-3 py-1 border w-fit`} data-testid="plan-status">
                <span className="mr-1">{statusConfig.icon}</span>
                {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground space-x-1">
              <Calendar className="h-3 w-3" />
              <span>Created {new Date(plan.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50" data-testid="button-edit">
              <Edit className="h-3 w-3 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50" data-testid="button-restart">
              <RotateCcw className="h-3 w-3 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Restart</span>
            </Button>
            <Button variant="outline" size="sm" className="text-xs hover:bg-muted/50" data-testid="button-export">
              <Download className="h-3 w-3 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <Target className="h-4 w-4 text-chart-2" />
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Start Wager</p>
            </div>
            <p className="text-lg sm:text-xl font-bold money-text text-foreground" data-testid="stat-start-wager">
              R {parseFloat(plan.startWager).toLocaleString()}
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-chart-1" />
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Odds</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground font-mono" data-testid="stat-odds">
              {parseFloat(plan.odds).toFixed(2)}
            </p>
          </div>
          
          <div className="bg-card rounded-lg border border-border p-4 hover:shadow-lg transition-all duration-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="h-4 w-4 text-chart-3" />
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">Duration</p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground" data-testid="stat-duration">
              {plan.days} days
            </p>
          </div>

          <div className={`bg-gradient-to-br ${statusConfig.gradient} rounded-lg border border-border p-4 hover:shadow-lg transition-all duration-200`}>
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-chart-1" />
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {plan.status === "active" ? "Current Day" : "Final Day"}
              </p>
            </div>
            <p className="text-lg sm:text-xl font-bold text-foreground">
              {plan.status === "active" ? `${completedDays + 1}` : `${completedDays}`}
            </p>
          </div>
        </div>

        {/* Progress Overview for Active Plans */}
        {plan.status === "active" && (
          <div className="bg-gradient-to-r from-chart-1/10 to-chart-1/5 rounded-xl border border-chart-1/20 p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Progress Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Day {completedDays + 1} of {plan.days} • {((completedDays / plan.days) * 100).toFixed(1)}% Complete
                </p>
              </div>
              <div className="mt-3 sm:mt-0">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Current Wager</p>
                  <p className="text-xl font-bold text-chart-1 money-text">
                    R {parseFloat(currentWager).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="w-full bg-chart-1/10 rounded-full h-3 mb-4">
              <div 
                className="h-3 rounded-full bg-gradient-to-r from-chart-1 to-chart-1/70 transition-all duration-1000 ease-out" 
                style={{ width: `${(completedDays / plan.days) * 100}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Wins:</span>
                <span className="font-semibold text-green-600">{completedDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Potential Final:</span>
                <span className="font-semibold text-chart-1 money-text">R {potentialFinal.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Plan Table */}
        <PlanTable plan={plan} dayEntries={dayEntries} />
      </div>
    </div>
  );
}
