import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './pages/admin/layout';
import { DashboardPage } from './pages/admin/dashboard';
import { CareersPortalPage } from './pages/careers/index';

function App() {
  const isCareersSubdomain = window.location.hostname.startsWith('careers');

  if (isCareersSubdomain) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/*" element={<CareersPortalPage />} />
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
