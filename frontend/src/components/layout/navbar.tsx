import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function Navbar() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    },
  });

  return (
    <nav className="bg-card border-b border-border px-4 py-3 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              {/* Responsive Logo */}
              <img
                src="frontend/src/logo.png"
                alt="Money Marathon Logo"
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 object-contain"
              />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                Money Marathon
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/">
              <a
                className="text-foreground hover:text-primary transition-colors font-medium"
                data-testid="nav-dashboard"
              >
                Dashboard
              </a>
            </Link>
            <span className="text-muted-foreground hover:text-primary transition-colors cursor-not-allowed">
              Analytics
            </span>
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
          </Button>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-foreground">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
            <span
              className="hidden sm:block text-sm font-medium"
              data-testid="user-name"
            >
              {user?.name}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  );
}
