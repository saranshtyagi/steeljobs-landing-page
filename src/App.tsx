import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "@/components/AdminRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import RecruiterDashboard from "./pages/dashboard/RecruiterDashboard";
import CandidateDashboard from "./pages/dashboard/CandidateDashboard";
import CandidateOnboarding from "./pages/onboarding/CandidateOnboarding";
import RecruiterOnboarding from "./pages/onboarding/RecruiterOnboarding";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCandidates from "./pages/admin/AdminCandidates";
import AdminRecruiters from "./pages/admin/AdminRecruiters";
import AdminLogs from "./pages/admin/AdminLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route
              path="/dashboard/recruiter"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/candidate"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/candidate"
              element={
                <ProtectedRoute allowedRole="candidate">
                  <CandidateOnboarding />
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding/recruiter"
              element={
                <ProtectedRoute allowedRole="recruiter">
                  <RecruiterOnboarding />
                </ProtectedRoute>
              }
            />
            {/* Hidden Admin Routes - No UI links point here */}
            <Route path="/admin" element={<AdminRoute><AdminOverview /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
            <Route path="/admin/candidates" element={<AdminRoute><AdminCandidates /></AdminRoute>} />
            <Route path="/admin/recruiters" element={<AdminRoute><AdminRecruiters /></AdminRoute>} />
            <Route path="/admin/logs" element={<AdminRoute><AdminLogs /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
