import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import WalletListPage from '@/pages/wallets/WalletListPage';
import WalletDetailPage from '@/pages/wallets/WalletDetailPage';
import SalaryPage from '@/pages/salaries/SalaryPage';
import HomeListPage from '@/pages/homes/HomeListPage';
import HomeDetailPage from '@/pages/homes/HomeDetailPage';
import { useAuth } from '@/contexts/AuthContext';

function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/wallets" replace />} />
          <Route path="wallets" element={<WalletListPage />} />
          <Route path="wallets/:id" element={<WalletDetailPage />} />
          <Route path="salaries" element={<SalaryPage />} />
          <Route path="homes" element={<HomeListPage />} />
          <Route path="homes/:id" element={<HomeDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
