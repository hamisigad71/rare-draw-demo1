import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";

const DashboardPage = () => {
  const navigate = useNavigate();
  const demoMode = localStorage.getItem("demo_mode");

  useEffect(() => {
    // If not in demo mode and not authenticated, redirect to auth
    // For now, we'll allow access if demo mode is enabled
  }, [navigate]);

  return <Dashboard />;
};

export default DashboardPage;
