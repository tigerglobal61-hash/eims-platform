import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RealTimeMonitoring from "./pages/RealTimeMonitoring";
import NoiseAnalysis from "./pages/NoiseAnalysis";
import DustAnalysis from "./pages/DustAnalysis";
import EnvironmentAnalysis from "./pages/EnvironmentAnalysis";
import CorrelationAnalysis from "./pages/CorrelationAnalysis";
import EventLog from "./pages/EventLog";
import Reports from "./pages/Reports";
import DataManagement from "./pages/DataManagement";
import Settings from "./pages/Settings";

function ProtectedRoute() {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/real-time-monitoring" element={<RealTimeMonitoring />} />
          <Route path="/noise-analysis" element={<NoiseAnalysis />} />
          <Route path="/dust-analysis" element={<DustAnalysis />} />
          <Route path="/environment-analysis" element={<EnvironmentAnalysis />} />
          <Route path="/correlation-analysis" element={<CorrelationAnalysis />} />
          <Route path="/event-log" element={<EventLog />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/data-management" element={<DataManagement />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
