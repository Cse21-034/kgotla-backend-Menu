import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { insertPlanSchema, type InsertPlan } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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
        title: "Plan created!",
        description: "Your new betting plan has been generated successfully.",
      });
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create plan",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertPlan) => {
    createPlanMutation.mutate(data);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6">Create New Plan</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            placeholder="e.g., January Money Plan"
            {...register("name")}
            data-testid="input-plan-name"
          />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startWager">Start Wager</Label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-muted-foreground">R</span>
              <Input
                id="startWager"
                type="number"
                placeholder="100"
                className="pl-8"
                {...register("startWager", { valueAsNumber: true })}
                data-testid="input-start-wager"
              />
            </div>
            {errors.startWager && (
              <p className="text-sm text-destructive">{errors.startWager.message}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="odds">Odds</Label>
            <Input
              id="odds"
              type="number"
              step="0.01"
              placeholder="1.50"
              {...register("odds", { valueAsNumber: true })}
              data-testid="input-odds"
            />
            {errors.odds && (
              <p className="text-sm text-destructive">{errors.odds.message}</p>
            )}
          </div>
        </div>
        
        <div>
          <Label htmlFor="days">Duration (Days)</Label>
          <Select
            onValueChange={(value) => setValue("days", parseInt(value))}
            defaultValue="30"
          >
            <SelectTrigger data-testid="select-duration">
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15">15 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="45">45 days</SelectItem>
              <SelectItem value="60">60 days</SelectItem>
            </SelectContent>
          </Select>
          {errors.days && (
            <p className="text-sm text-destructive">{errors.days.message}</p>
          )}
        </div>
        
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Estimated Final Winnings:</span>
            <span className="font-bold text-chart-1 money-text" data-testid="estimated-winnings">
              R {estimatedWinnings.toLocaleString()}
            </span>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={createPlanMutation.isPending}
          data-testid="button-generate-plan"
        >
          {createPlanMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Generate Plan
        </Button>
      </form>
    </div>
  );
}
