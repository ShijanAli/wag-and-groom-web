import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import ServicesPage from "./pages/ServicesPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import CustomerDashboard from "./pages/dashboard/CustomerDashboard";
import StaffDashboard from "./pages/staff/StaffDashboard";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import NotFound from "./pages/NotFound";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminServices from "./pages/admin/AdminServices";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminGallery from "./pages/admin/AdminGallery";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminRoles from "./pages/admin/AdminRoles";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AppProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Index />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Customer */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={["customer"]}><CustomerDashboard /></ProtectedRoute>
              } />

              {/* Staff */}
              <Route path="/staff" element={
                <ProtectedRoute allowedRoles={["staff"]}><StaffDashboard /></ProtectedRoute>
              } />

              {/* Manager */}
              <Route path="/manager" element={
                <ProtectedRoute allowedRoles={["manager", "admin"]}><ManagerDashboard /></ProtectedRoute>
              } />

              {/* Admin */}
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={["admin", "manager"]}><AdminLayout /></ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="services" element={<AdminServices />} />
                <Route path="customers" element={<AdminCustomers />} />
                <Route path="staff" element={<AdminStaff />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="gallery" element={<AdminGallery />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="roles" element={<AdminRoles />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
