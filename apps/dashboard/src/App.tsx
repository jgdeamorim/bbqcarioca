import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './pages/admin/layout';
import { DashboardPage } from './pages/admin/dashboard';
import { CareersPortalPage } from './pages/careers/index';
import { ClientPortalPage } from './pages/portal/index';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Raiz redireciona para Admin por segurança, ou pode ser um Landing/Login genérico */}
        <Route path="/" element={<Navigate to="/admin" replace />} />
        
        {/* Tenant 1: Admin Control Plane */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          {/* Futuras rotas aninhadas de Admin */}
        </Route>

        {/* Tenant 2: Staff / Careers Portal */}
        <Route path="/careers/*" element={<CareersPortalPage />} />

        {/* Tenant 3: Customer Portal */}
        <Route path="/client/*" element={<ClientPortalPage />} />
        
        {/* Rota Fallback */}
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
