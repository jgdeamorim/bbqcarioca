import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './pages/admin/layout';
import { DashboardPage } from './pages/admin/dashboard';

function App() {
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
