import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DashboardLayout } from "./components/layout/DashboardLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { Settings } from "./pages/Settings";
import { SignIn } from "./pages/SignIn";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="attendance" element={
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Physical Garage Attendance</h1>
                  <p className="text-gray-300 text-sm sm:text-base mt-2">Coming Soon</p>
                </div>
              </div>
            } />
            <Route path="analytics" element={
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Analytics</h1>
                  <p className="text-gray-300 text-sm sm:text-base mt-2">Coming Soon</p>
                </div>
              </div>
            } />
            <Route path="reports" element={
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Reports</h1>
                  <p className="text-gray-300 text-sm sm:text-base mt-2">Coming Soon</p>
                </div>
              </div>
            } />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </AuthProvider>
  );
}