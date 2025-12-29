import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dashboard } from "@/components/Dashboard";

const DashboardPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Dashboard component handles auth check and redirect
  }, [navigate]);

  return <Dashboard />;
};

export default DashboardPage;
