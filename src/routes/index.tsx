import { BrowserRouter, Routes, Route, Navigate, Outlet, useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import EntriesPage from '@/pages/entries/EntriesPage';
import CategoriesPage from '@/pages/categories/CategoriesPage';
import BalancesPage from '@/pages/balances/BalancesPage';
import MenuPage from '@/pages/menu/MenuPage';
import EditProfilePage from '@/pages/menu/EditProfilePage';
import DailyBudgetPage from '@/pages/menu/DailyBudgetPage';
import SettingsPage from '@/pages/menu/SettingsPage';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      login(token);
      window.location.href = '/';
    }
  }, [token, login]);

  return null;
}

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
        <Route path="/auth/callback" element={<OAuthCallback />} />
        <Route element={<ProtectedLayout />}>
          <Route index element={<BalancesPage />} />
          <Route path="totais" element={<DashboardPage />} />
          <Route path="tags" element={<CategoriesPage />} />
          <Route path="entries" element={<EntriesPage />} />
          <Route path="menu" element={<MenuPage />} />
          <Route path="menu/perfil" element={<EditProfilePage />} />
          <Route path="menu/previsao-diario" element={<DailyBudgetPage />} />
          <Route path="menu/configuracoes" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
