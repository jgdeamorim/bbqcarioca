import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ClientStepper } from './onboarding/Stepper';
import { ClientDashboard } from './dashboard';

export function ClientPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock Auth State (Replace with real JWT/Zustand logic later)
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // If not authenticated and trying to access dashboard directly, redirect to onboarding
    if (!isAuthenticated && location.pathname === '/client/dashboard') {
      navigate('/client', { replace: true });
    }
    // If authenticated and trying to access onboarding, redirect to dashboard
    if (isAuthenticated && location.pathname === '/client') {
      navigate('/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<ClientStepper />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
    </Routes>
  );
}
