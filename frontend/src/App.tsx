// App.tsx
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
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const handleError = (error: any) => {
      console.error("ErrorBoundary caught error:", error);
      setHasError(true);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Something went wrong</h1>
          <p className="text-muted-foreground mt-2">Please try again or contact support.</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Page
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

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

  if (!user) {
    return <Login />;
  }

  return (
    <ErrorBoundary>
      <AuthenticatedApp />
    </ErrorBoundary>
  );
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
