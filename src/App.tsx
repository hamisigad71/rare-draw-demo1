import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, Suspense, lazy } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LoadingFallback } from "@/components/LoadingFallback";
import { logger, updateLoggerContext } from "@/lib/logger";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Marketplace = lazy(() => import("./pages/Marketplace"));
const Game = lazy(() => import("./pages/Game"));
const GameEnd = lazy(() => import("./pages/GameEnd"));
const Library = lazy(() => import("./pages/Library"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Demo = lazy(() => import("./pages/Demo"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminCardGeneration = lazy(() => import("./pages/AdminCardGeneration"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteLogger = () => {
  const location = useLocation();

  useEffect(() => {
    updateLoggerContext({ currentRoute: location.pathname });
    logger.info("Route changed", {
      pathname: location.pathname,
      search: location.search,
    });
  }, [location.pathname, location.search]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ThemeToggle />
      <BrowserRouter>
        <RouteLogger />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/game" element={<Game />} />
            <Route path="/game-end" element={<GameEnd />} />
            <Route path="/library" element={<Library />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/demo" element={<Demo />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/generate-cards" element={<AdminCardGeneration />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
