import { useQuery } from "@tanstack/react-query";
import { Plan } from "@/types/schema";

interface PlansResponse {
  plans: Plan[];
}

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ["/api/plans"],
    select: (data: any) => data?.plans || [],
  });
}