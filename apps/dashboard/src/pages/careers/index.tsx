import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { TalentStepper } from './application/TalentStepper';
import { MissionsDashboard } from './missions';

export function CareersPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Mock Auth State (Replace with real JWT/Zustand logic later)
  const [isAuthenticated, _setIsAuthenticated] = useState(false);

  useEffect(() => {
    // If not authenticated and trying to access dashboard directly, redirect to onboarding
    if (!isAuthenticated && location.pathname === '/careers/missions') {
      navigate('/careers', { replace: true });
    }
    // If authenticated and trying to access onboarding, redirect to dashboard
    if (isAuthenticated && location.pathname === '/careers') {
      navigate('/careers/missions', { replace: true });
    }
  }, [isAuthenticated, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<TalentStepper />} />
      <Route path="/missions" element={<MissionsDashboard />} />
    </Routes>
  );
}
