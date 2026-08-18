import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ClientStepper } from './onboarding/Stepper';
import { ClientDashboard } from './dashboard';
import { useAuthStore } from '../../lib/authStore';

export function ClientPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const role = useAuthStore(state => state.role);

  useEffect(() => {
    // If not authenticated and trying to access dashboard directly, redirect to onboarding
    if (!isAuthenticated && location.pathname === '/client/dashboard') {
      navigate('/client', { replace: true });
    }
    // If authenticated and trying to access onboarding, redirect to dashboard seamlessly
    if (isAuthenticated && role === 'customer' && location.pathname === '/client') {
      navigate('/client/dashboard', { replace: true });
    }
  }, [isAuthenticated, role, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<ClientStepper />} />
      <Route path="/dashboard" element={<ClientDashboard />} />
    </Routes>
  );
}
