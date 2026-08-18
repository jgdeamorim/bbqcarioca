import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { TalentStepper } from './application/TalentStepper';
import { MissionsDashboard } from './missions';
import { useAuthStore } from '../../lib/authStore';

export function CareersPortalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAuthenticated = useAuthStore(state => state.isAuthenticated());
  const role = useAuthStore(state => state.role);

  useEffect(() => {
    // If not authenticated and trying to access dashboard directly, redirect to onboarding
    if (!isAuthenticated && location.pathname === '/careers/missions') {
      navigate('/careers', { replace: true });
    }
    // If authenticated and trying to access onboarding, redirect to dashboard seamlessly
    if (isAuthenticated && role === 'talent' && location.pathname === '/careers') {
      navigate('/careers/missions', { replace: true });
    }
  }, [isAuthenticated, role, location.pathname, navigate]);

  return (
    <Routes>
      <Route path="/" element={<TalentStepper />} />
      <Route path="/missions" element={<MissionsDashboard />} />
    </Routes>
  );
}
