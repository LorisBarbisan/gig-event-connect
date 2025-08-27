import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { Route, Router, Switch } from "wouter";
import { OptimizedAuthProvider } from "@/hooks/useOptimizedAuth";
import { queryClient } from "@/lib/queryClient";

// OPTIMIZED APP: Simplified routing with essential pages only

import Index from "./pages/Index";
import Auth from "./pages/Auth-optimized";
import Dashboard from "./pages/Dashboard-optimized";
import Profile from "./pages/Profile-optimized";
import Jobs from "./pages/Jobs-optimized";
import NotFound from "./pages/NotFound";

const OptimizedApp = () => (
  <QueryClientProvider client={queryClient}>
    <OptimizedAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <Switch>
            <Route path="/" component={Index} />
            <Route path="/auth" component={Auth} />
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/profile/:userId" component={Profile} />
            <Route path="/jobs" component={Jobs} />
            <Route component={NotFound} />
          </Switch>
        </Router>
      </TooltipProvider>
    </OptimizedAuthProvider>
  </QueryClientProvider>
);

export default OptimizedApp;