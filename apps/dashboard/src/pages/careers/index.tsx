import { Routes, Route, Navigate } from 'react-router-dom';

import { MissionsDashboard } from './missions';

export function CareersPortalPage() {

  return (
    <Routes>
      <Route path="/missions" element={<MissionsDashboard />} />
      <Route path="*" element={<Navigate to="/careers/missions" replace />} />
    </Routes>
  );
}
