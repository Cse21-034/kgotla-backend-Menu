import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertPlanSchema, type InsertPlan } from "@/types/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Calculator, Target, Zap, Calendar, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";

interface CreatePlanFormProps {
  onSuccess?: () => void;
}

export function CreatePlanForm({ onSuccess }: CreatePlanFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [estimatedWinnings, setEstimatedWinnings] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<InsertPlan>({
    resolver: zodResolver(insertPlanSchema),
    defaultValues: {
      name: "",
      startWager: 100,
      odds: 1.5,
      days: 30,
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    const { startWager, odds, days } = watchedValues;
    if (startWager && odds && days) {
      const final = startWager * Math.pow(odds, days);
      setEstimatedWinnings(final);
    }
  }, [watchedValues]);

  const createPlanMutation = useMutation({
    mutationFn: async (data: InsertPlan) => {
      const response = await apiRequest("POST", "/api/plans", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "🎉 Plan created!",
        description: "Your new betting plan has been generated successfully.",
        duration: 3000,
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Failed to create plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPlan) => {
    createPlanMutation.mutate(data);
  };

  const multiplierEffect = watchedValues.odds && watchedValues.days 
    ? ((estimatedWinnings / (watchedValues.startWager || 100)) - 1) * 100 
    : 0;

  const riskLevel = watchedValues.odds > 2 ? "high" : watchedValues.odds > 1.5 ? "medium" : "low";
  const riskConfig = {
    low: { color: "text-green-600", bg: "bg-green-100", icon: "🟢" },
    medium: { color: "text-yellow-600", bg: "bg-yellow-100", icon: "🟡" },
    high: { color: "text-red-600", bg: "bg-red-100", icon: "🔴" }
  };

  return (
    <div className="bg-gradient-to-br from-card to-card/80 rounded-xl border border-border p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-chart-1/20 to-chart-1/10 rounded-xl flex items-center justify-center">
          <Calculator className="h-5 w-5 text-chart-1" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground">Create New Plan</h3>
          <p className="text-sm text-muted-foreground">Build your compound betting strategy</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* Plan Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="flex items-center space-x-2 text-sm font-medium">
            <Target className="h-4 w-4" />
            <span>Plan Name</span>
          </Label>
          <Input
            id="name"
            placeholder="e.g., January Money Plan"
            {...register("name")}
            className="transition-all duration-200 focus:ring-2 focus:ring-chart-1/20 focus:border-chart-1"
            data-testid="input-plan-name"
          />
          {errors.name && (
            <div className="flex items-center space-x-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.name.message}</span>
            </div>
          )}
        </div>
        
        {/* Start Wager & Odds */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startWager" className="flex items-center space-x-2 text-sm font-medium">
              <Zap className="h-4 w-4" />
              <span>Start Wager</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">R</span>
              <Input
                id="startWager"
                type="number"
                placeholder="100"
                className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-chart-1/20 focus:border-chart-1"
                {...register("startWager", { valueAsNumber: true })}
                data-testid="input-start-wager"
              />
            </div>
            {errors.startWager && (
              <div className="flex items-center space-x-1 text-sm text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.startWager.message}</span>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="odds" className="flex items-center space-x-2 text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              <span>Odds</span>
            </Label>
            <div className="relative">
              <Input
                id="odds"
                type="number"
                step="0.01"
                placeholder="1.50"
                className="transition-all duration-200 focus:ring-2 focus:ring-chart-1/20 focus:border-chart-1"
                {...register("odds", { valueAsNumber: true })}
                data-testid="input-odds"
              />
              <div className={`absolute right-3 top-1/2 -translate-y-1/2 ${riskConfig[riskLevel].color}`}>
                <span className="text-xs">{riskConfig[riskLevel].icon}</span>
              </div>
            </div>
            {errors.odds && (
              <div className="flex items-center space-x-1 text-sm text-destructive">
                <AlertCircle className="h-3 w-3" />
                <span>{errors.odds.message}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Duration */}
        <div className="space-y-2">
          <Label htmlFor="days" className="flex items-center space-x-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            <span>Duration</span>
          </Label>
          <Select
            onValueChange={(value) => setValue("days", parseInt(value))}
            defaultValue="30"
          >
            <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-chart-1/20 focus:border-chart-1" data-testid="select-duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 days (Sprint)</SelectItem>
              <SelectItem value="30">30 days (Standard)</SelectItem>
              <SelectItem value="45">45 days (Extended)</SelectItem>
              <SelectItem value="60">60 days (Marathon)</SelectItem>
            </SelectContent>
          </Select>
          {errors.days && (
            <div className="flex items-center space-x-1 text-sm text-destructive">
              <AlertCircle className="h-3 w-3" />
              <span>{errors.days.message}</span>
            </div>
          )}
        </div>

        {/* Risk Assessment */}
        <div className={`p-3 sm:p-4 rounded-lg ${riskConfig[riskLevel].bg} border`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Risk Assessment</span>
            <span className={`text-xs px-2 py-1 rounded-full ${riskConfig[riskLevel].bg} ${riskConfig[riskLevel].color} font-medium`}>
              {riskLevel.toUpperCase()} RISK
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {riskLevel === "low" && "Conservative approach with steady growth potential"}
            {riskLevel === "medium" && "Balanced risk with moderate growth expectations"}
            {riskLevel === "high" && "High risk strategy - ensure proper bankroll management"}
          </p>
        </div>
        
        {/* Estimated Winnings */}
        <div className="bg-gradient-to-r from-chart-1/10 to-chart-1/5 rounded-lg p-4 sm:p-6 border border-chart-1/20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-chart-1/20 rounded-lg flex items-center justify-center">
                <Calculator className="h-4 w-4 text-chart-1" />
              </div>
              <span className="text-sm font-medium text-foreground">Projection</span>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Multiplier Effect</p>
              <p className="text-sm font-bold text-chart-1">
                {multiplierEffect.toFixed(0)}%
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estimated Final Winnings:</span>
              <span className="font-bold text-chart-1 money-text text-lg" data-testid="estimated-winnings">
                R {estimatedWinnings.toLocaleString()}
              </span>
            </div>
            
            <div className="w-full bg-chart-1/10 rounded-full h-2">
              <div 
                className="h-2 rounded-full bg-gradient-to-r from-chart-1 to-chart-1/70 transition-all duration-500"
                style={{ width: `${Math.min((multiplierEffect / 1000) * 100, 100)}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-muted-foreground text-center">
              * Projections assume consecutive wins. Past performance doesn't guarantee future results.
            </p>
          </div>
        </div>
        
        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-chart-1 to-chart-1/80 hover:from-chart-1/90 hover:to-chart-1/70 text-white shadow-lg transition-all duration-200 py-3 sm:py-4"
          disabled={createPlanMutation.isPending}
          data-testid="button-generate-plan"
        >
          {createPlanMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Plan...
            </>
          ) : (
            <>
              <Calculator className="mr-2 h-4 w-4" />
              Generate Plan
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
