import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChauffeursPage } from './pages/ChauffeursPage';
import { CodesChauffeursPage } from './pages/CodesChauffeursPage';
import { CoursesPage } from './pages/CoursesPage';
import { VersementsPage } from './pages/VersementsPage';
import { AssistancePage } from './pages/AssistancePage';
import { MotosPage } from './pages/MotosPage';
import { ProprietairesPage } from './pages/ProprietairesPage';
import { PointagesAdminPage } from './pages/PointagesAdminPage';
import { ContratsPage } from './pages/ContratsPage';
import { DepensesPage } from './pages/DepensesPage';
import { NotificationsAdminPage } from './pages/NotificationsAdminPage';
import { ParametresPage } from './pages/ParametresPage';
import { Layout } from './components/Layout';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/chauffeurs" element={<ChauffeursPage />} />
            <Route path="/codes" element={<CodesChauffeursPage />} />
            <Route path="/motos" element={<MotosPage />} />
            <Route path="/proprietaires" element={<ProprietairesPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/versements" element={<VersementsPage />} />
            <Route path="/pointages" element={<PointagesAdminPage />} />
            <Route path="/assistance" element={<AssistancePage />} />
            <Route path="/contrats" element={<ContratsPage />} />
            <Route path="/depenses" element={<DepensesPage />} />
            <Route path="/rapports" element={<div className="p-6 text-gray-400">📊 Rapports (à venir)</div>} />
            <Route path="/messages" element={<div className="p-6 text-gray-400">💬 Messages (à venir)</div>} />
            <Route path="/notifications" element={<NotificationsAdminPage />} />
            <Route path="/parametres" element={<ParametresPage />} />
            <Route path="/utilisateurs" element={<div className="p-6 text-gray-400">👥 Utilisateurs (à venir)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
