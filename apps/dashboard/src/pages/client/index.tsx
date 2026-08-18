import { Routes, Route, Navigate } from 'react-router-dom';

import { ClientDashboard } from './dashboard';

export function ClientPortalPage() {

  return (
    <Routes>
      <Route path="/dashboard" element={<ClientDashboard />} />
      <Route path="*" element={<Navigate to="/client/dashboard" replace />} />
    </Routes>
  );
}
