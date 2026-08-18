import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './pages/admin/layout';
import { DashboardPage } from './pages/admin/dashboard';
import { CareersPortalPage } from './pages/careers/index';
import { ClientPortalPage } from './pages/portal/index';

function App() {
  const isCareersSubdomain = window.location.hostname.startsWith('careers');
  const isPortalSubdomain = window.location.hostname.startsWith('portal') || window.location.hostname.startsWith('client');

  if (isCareersSubdomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<CareersPortalPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  if (isPortalSubdomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<ClientPortalPage />} />
        </Routes>
      </BrowserRouter>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Outras rotas serão adicionadas aqui (Customers, Quotes, Events, etc) */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
