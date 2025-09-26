import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/Layout";
import { useHashScroll } from "@/hooks/use-hash-scroll";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { Dashboard } from "./pages/Dashboard";
import Opportunities from "./pages/Opportunities";
import CreateOpportunity from "./pages/CreateOpportunity";
import OpportunityDetail from "./pages/OpportunityDetail";
import { Profile } from "./pages/Profile";
import { MyApplications } from "./pages/MyApplications";
import { MyOpportunities } from "./pages/MyOpportunities";
import { About } from "./pages/About";
import { Impact } from "./pages/Impact";
import { Help } from "./pages/Help";
import { Contact } from "./pages/Contact";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { Organization } from "./pages/Organization";
import { ForgotPassword } from "./pages/ForgotPassword";
import OrganizationProfile from "./pages/OrganizationProfile";
import { Partners } from "./pages/Partners";
import { VolunteerGuide } from "./pages/VolunteerGuide";
import { HostGuide } from "./pages/HostGuide";
import { Blog } from "./pages/Blog";
import { BlogPost } from "./pages/BlogPost";
import { Notifications } from "./pages/Notifications";
import { Messages } from "./pages/Messages";
import { Courses } from "./pages/Courses";
import { CourseDetail } from "./pages/CourseDetail";
import { ModuleViewer } from "./pages/ModuleViewer";
import { LearningDashboard } from "./pages/LearningDashboard";

const queryClient = new QueryClient();

// Component that uses the hash scroll hook
const AppRoutes = () => {
  useHashScroll();
  
  return (
    <Routes>
      <Route path="/" element={<Layout><Index /></Layout>} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/opportunities" element={<Layout><Opportunities /></Layout>} />
      <Route path="/opportunities/:id" element={<Layout><OpportunityDetail /></Layout>} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/opportunities/create" 
        element={
          <ProtectedRoute requiredUserType="host">
            <Layout><CreateOpportunity /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Layout><Profile /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/applications" 
        element={
          <ProtectedRoute requiredUserType="volunteer">
            <Layout><MyApplications /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-opportunities" 
        element={
          <ProtectedRoute requiredUserType="host">
            <Layout><MyOpportunities /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/organization" 
        element={
          <ProtectedRoute requiredUserType="host">
            <Layout><Organization /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/notifications" 
        element={
          <ProtectedRoute>
            <Layout><Notifications /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="/about" element={<Layout><About /></Layout>} />
      <Route path="/impact" element={<Layout><Impact /></Layout>} />
      <Route path="/help" element={<Layout><Help /></Layout>} />
      <Route path="/contact" element={<Layout><Contact /></Layout>} />
      <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
      <Route path="/terms" element={<Layout><Terms /></Layout>} />
      <Route path="/organizations/:id" element={<Layout><OrganizationProfile /></Layout>} />
      <Route path="/partners" element={<Layout><Partners /></Layout>} />
      <Route path="/volunteer-guide" element={<Layout><VolunteerGuide /></Layout>} />
      <Route path="/host-guide" element={<Layout><HostGuide /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/blog/:id" element={<Layout><BlogPost /></Layout>} />
      <Route 
        path="/messages" 
        element={
          <ProtectedRoute>
            <Layout><Messages /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route path="/courses" element={<Layout><Courses /></Layout>} />
      <Route path="/courses/:courseId" element={<Layout><CourseDetail /></Layout>} />
      <Route 
        path="/courses/:courseId/module/:moduleId" 
        element={
          <ProtectedRoute>
            <Layout><ModuleViewer /></Layout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/learning" 
        element={
          <ProtectedRoute>
            <Layout><LearningDashboard /></Layout>
          </ProtectedRoute>
        } 
      />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
