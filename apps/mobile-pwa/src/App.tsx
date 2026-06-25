import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CoursesPage } from './pages/CoursesPage';
import { VersementsPage } from './pages/VersementsPage';
import { StatsPage } from './pages/StatsPage';
import { ProfilPage } from './pages/ProfilPage';
import { Header } from './components/Header';
import { Nav } from './components/Nav';

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('chauffeur-token');
  if (!token) return <Navigate to="/login" replace />;
  return (
    <>
      <Header />
      {children}
      <Nav />
    </>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
      <Route path="/courses" element={<Layout><CoursesPage /></Layout>} />
      <Route path="/versements" element={<Layout><VersementsPage /></Layout>} />
      <Route path="/stats" element={<Layout><StatsPage /></Layout>} />
      <Route path="/profil" element={<Layout><ProfilPage /></Layout>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
