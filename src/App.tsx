import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AdminGuard from "@/components/guards/AdminGuard";
import AuthGuard from "@/components/guards/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CompanyProfile from "./pages/CompanyProfile";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCompanies from "./pages/admin/AdminCompanies";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminVerification from "./pages/admin/AdminVerification";
import DashboardProfile from "./pages/dashboard/DashboardProfile";
import DashboardProjects from "./pages/dashboard/DashboardProjects";
import DashboardServices from "./pages/dashboard/DashboardServices";
import DashboardTeam from "./pages/dashboard/DashboardTeam";
import DashboardWorks from "./pages/dashboard/DashboardWorks";
import DashboardSettings from "./pages/dashboard/DashboardSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/company/:slug" element={<CompanyProfile />} />
            
            {/* Company Dashboard Routes */}
            <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
            <Route path="/dashboard/profile" element={<AuthGuard><DashboardProfile /></AuthGuard>} />
            <Route path="/dashboard/projects" element={<AuthGuard><DashboardProjects /></AuthGuard>} />
            <Route path="/dashboard/services" element={<AuthGuard><DashboardServices /></AuthGuard>} />
            <Route path="/dashboard/team" element={<AuthGuard><DashboardTeam /></AuthGuard>} />
            <Route path="/dashboard/works" element={<AuthGuard><DashboardWorks /></AuthGuard>} />
            <Route path="/dashboard/settings" element={<AuthGuard><DashboardSettings /></AuthGuard>} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
            <Route path="/admin/companies" element={<AdminGuard><AdminCompanies /></AdminGuard>} />
            <Route path="/admin/subscriptions" element={<AdminGuard><AdminSubscriptions /></AdminGuard>} />
            <Route path="/admin/payments" element={<AdminGuard><AdminPayments /></AdminGuard>} />
            <Route path="/admin/verification" element={<AdminGuard><AdminVerification /></AdminGuard>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
