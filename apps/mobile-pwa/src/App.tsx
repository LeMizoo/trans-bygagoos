import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PointagePage } from './pages/PointagePage';
import { CoursePage } from './pages/CoursePage';
import { VersementsPage } from './pages/VersementsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { MobileHeader } from './components/MobileHeader';
import { MobileNav } from './components/MobileNav';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';
  const token = useAuthStore((s) => s.token);

  if (isLogin || !token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', paddingBottom: 80, fontFamily: 'system-ui, sans-serif' }}>
      <MobileHeader />
      <div style={{ paddingBottom: 80 }}>
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pointage" element={<PointagePage />} />
          <Route path="/course" element={<CoursePage />} />
          <Route path="/versements" element={<VersementsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
      <MobileNav />
    </div>
  );
}

function AppInit() {
  const loadFromStorage = useAuthStore((s) => s.loadFromStorage);
  useEffect(() => { loadFromStorage(); }, []);
  return <AppLayout />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppInit />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
