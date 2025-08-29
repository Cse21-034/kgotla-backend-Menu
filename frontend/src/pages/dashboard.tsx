// pages/dashboard.tsx
import { StatsCards } from "@/components/dashboard/stats-cards";
import { PlanCard } from "@/components/dashboard/plan-card";
import { CreatePlanForm } from "@/components/dashboard/create-plan-form";
import { AnalyticsCharts } from "@/components/analytics/analytics-charts";
import { usePlans } from "@/hooks/use-plans";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

// 🔹 Top Image Carousel Component
function ImageCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const images = [
    { src: "https://iili.io/K3gpQ6J.png", alt: "Ad Image 1" },
    { src: "https://iili.io/K34hSVa.png", alt: "Ad Image 2" },
    { src: "https://iili.io/K34NHw7.png", alt: "Ad Image 3" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="bg-white text-center py-4 border-b">
      <div className="relative max-w-md mx-auto bg-background rounded-lg shadow-md overflow-hidden">
        <div className="relative h-48 w-full overflow-hidden">
          <img
            src={images[currentIndex].src}
            alt={images[currentIndex].alt}
            className="w-full h-full object-cover transition-opacity duration-300"
          />

          {/* Arrows */}
          <button
            onClick={() =>
              setCurrentIndex(
                currentIndex === 0 ? images.length - 1 : currentIndex - 1
              )
            }
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() =>
              setCurrentIndex(
                currentIndex === images.length - 1 ? 0 : currentIndex + 1
              )
            }
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-70"
          >
            <ChevronRight size={20} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
            {currentIndex + 1} / {images.length}
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-2 py-3 bg-muted/30">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary scale-125"
                  : "bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 🔹 Sticky Footer Affiliate Carousel
function StickyFooterAd() {
  const affiliateAds = [
    { src: "https://track.deriv.com/_-1DpJjc-4Ugad7NeR55Oi2Nd7ZgqdRLk/1/", link: "https://track.deriv.com/_-1DpJjc-4Ugad7NeR55Oi2Nd7ZgqdRLk/1/" },
    { src: "https://iili.io/K34hSVa.png", link: "https://promo2.com" },
    { src: "https://iili.io/K34NHw7.png", link: "https://promo3.com" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % affiliateAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [affiliateAds.length]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 z-50">
      <a
        href={affiliateAds[currentIndex].link}
        target="_blank"
        rel="noopener noreferrer"
      >
        <img
          src={affiliateAds[currentIndex].src}
          alt="Affiliate Banner"
          className="w-full h-16 sm:h-20 object-contain mx-auto transition-opacity duration-700"
        />
      </a>
    </div>
  );
}

// 🔹 Dashboard Page
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

  const plansArray = Array.isArray(data?.plans) ? data.plans : [];
  const activePlans = plansArray.filter((plan: any) => plan.status === "active");

  return (
    <div className="min-h-screen bg-background">
      {/* Top Banner Carousel */}
      <ImageCarousel />

      <div className="max-w-7xl mx-auto px-4 py-6 pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm">
              Track your compound betting progressions
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Plan
          </Button>
        </div>

        {/* Stats */}
        <StatsCards plans={plansArray} />

        {/* Plans */}
        <div className="grid grid-cols-1 gap-6 mb-8">
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

          {/* Example Sidebar Ad */}
          <div className="bg-card text-center p-4 rounded-xl border border-border shadow-md">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Sponsored
            </p>
            <a
              href="https://your-ad-link.com"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src="https://iili.io/KFIn5Ga.png"
                alt="Ad"
                className="w-full max-w-sm sm:max-w-md mx-auto h-20 sm:h-24 object-contain rounded-md transition-transform hover:scale-105"
              />
            </a>
          </div>

          {/* Create Plan Form */}
          <div className="sticky top-24">
            {showCreateForm ? (
              <CreatePlanForm onSuccess={() => setShowCreateForm(false)} />
            ) : (
              <div className="bg-card rounded-lg border border-border p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Ready to start a new betting marathon?
                </p>
                <Button
                  onClick={() => setShowCreateForm(true)}
                  variant="outline"
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

      {/* Sticky Footer Affiliate Carousel */}
      <StickyFooterAd />
    </div>
  );
}

