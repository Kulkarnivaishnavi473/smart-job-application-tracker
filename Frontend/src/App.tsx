import { useState } from "react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { JobApplication } from "@/types";


import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddJob from "./pages/AddJob";
import Resumes from "./pages/Resumes";
import JobDetails from "./pages/JobDetails";
import NotFound from "./pages/NotFound";
import ResumeAnalyzer from "./pages/ResumeAnalyzer";
import ProtectedRoute from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [jobs, setJobs] = useState<JobApplication[]>(() => {
  const saved = localStorage.getItem("jobs");
  return saved ? JSON.parse(saved) : [];
});
  useEffect(() => {
  localStorage.setItem("jobs", JSON.stringify(jobs));
}, [jobs]);


  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<DashboardLayout />}>
  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
  
  {/* Add Job */}
  <Route path="/add-job" element={<AddJob />} />
  
  <Route path="/resumes" element={<ProtectedRoute><Resumes /></ProtectedRoute>} />
  
  {/* Job Details */}
  <Route path="/jobs/:id" element={<JobDetails />} />

  {/* Edit Job */}
  <Route
    path="/jobs/:id/edit"
    element={<AddJob isEdit={true} />}
  />
  <Route path="/resume-analyzer" element={<ResumeAnalyzer />} />   {/* ADD THIS */}
</Route>


            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
