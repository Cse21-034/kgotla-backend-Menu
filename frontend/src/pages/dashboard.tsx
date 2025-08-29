// pages/dashboard.tsx
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PlanCard } from "@/components/dashboard/plan-card";
import { CreatePlanForm } from "@/components/dashboard/create-plan-form";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { usePlans } from "@/hooks/use-plans";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// Image Carousel Component
function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Array of images for the carousel
  const images = [
    {
      src: "https://iili.io/K3gpQ6J.png",
      alt: "Ad Image 1"
    },
    {
      src: "https://iili.io/K34hSVa.png",
      alt: "Ad Image 2"
    },
    {
      src: "https://iili.io/K34NHw7.png",
      alt: "Ad Image 3"
    }
  ];

  // Auto-advance carousel every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  const goToPrevious = () => {
    setCurrentIndex(currentIndex === 0 ? images.length - 1 : currentIndex - 1);
  };

  const goToNext = () => {
    setCurrentIndex(currentIndex === images.length - 1 ? 0 : currentIndex + 1);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="bg-white text-center py-4 border-b">
      
      
      {/* Carousel Container */}
      <div className="relative max-w-md mx-auto bg-background rounded-lg shadow-md overflow-hidden">
        {/* Image Display */}
        <div className="relative h-48 w-full overflow-hidden">
          <img 
            src={images[currentIndex].src} 
            alt={images[currentIndex].alt}
            className="w-full h-full object-cover transition-opacity duration-300"
          />
          
          {/* Navigation Arrows */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          
          <button
            onClick={goToNext}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70 transition-all"
          >
            <ChevronRight size={20} />
          </button>

          {/* Image Counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
        
        {/* Dot Indicators */}
        <div className="flex justify-center space-x-2 py-3 bg-muted/30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex 
                  ? 'bg-primary scale-125' 
                  : 'bg-muted-foreground/40 hover:bg-muted-foreground/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data, isLoading } = usePlans();
  const [showCreateForm, setShowCreateForm] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse space-y-6 w-full max-w-3xl px-4">
          <div className="h-8 bg-muted rounded w-full"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg"></div>
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
    <div className="min-h-screen bg-background">
      {/* Banner Ad with Carousel - Top */}
      <ImageCarousel />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="page-title">Dashboard</h1>
            <p className="text-muted-foreground text-sm">Track your compound betting progressions</p>
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
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Active Plans */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Active Plans</h2>
            {activePlans.length > 0 ? (
              activePlans.map((plan: any) => (
                <PlanCard key={plan.id} plan={plan} />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground bg-card rounded-lg border border-border">
                <p>No active plans. Create your first plan to get started!</p>
              </div>
            )}
          </div>

          {/* Sidebar Ad - Side Banner */}
          <div className="bg-accent text-center py-4 rounded-lg border border-accent text-accent-foreground">
            <p>Sidebar Advertisement Here</p>
             <img src="https://iili.io/KFIn5Ga.png" alt="Ad" className="w-full h-auto" /> 
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

        {/* Bottom Banner Ad */}
        <div className="bg-accent text-center py-4 text-sm text-accent-foreground rounded-lg border border-accent mt-6">
          <p>Bottom Advertisement Banner Here</p>
          {/* Integrate ad script or image here */}
        </div>
      </div>
    </div>
  );
}
