 import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import PlanDetails from "@/pages/plan-details";
import { useAuth } from "@/hooks/use-auth";
import { Navbar } from "@/components/layout/navbar";

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/plans/:id" component={PlanDetails} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function Router() {
  const { user, isLoading, hasChecked } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading || !hasChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page only after we've confirmed user is not authenticated
  if (!user) {
    return <Login />;
  }

  // User is authenticated, show the app
  return <AuthenticatedApp />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
