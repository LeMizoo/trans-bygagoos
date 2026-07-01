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
import { MessagesPage } from './pages/MessagesPage';
import { RapportsPage } from './pages/RapportsPage';
import { UtilisateursPage } from './pages/UtilisateursPage';
import { JournauxPage } from './pages/JournauxPage';
import { ParametresPage } from './pages/ParametresPage';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/public/LandingPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { FlottesAdminPage } from './pages/FlottesAdminPage';
import { AbonnementsPage } from './pages/AbonnementsPage';

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/flottes" element={<FlottesAdminPage />} />
            <Route path="/app/abonnements" element={<AbonnementsPage />} />
            <Route path="/app/chauffeurs" element={<ChauffeursPage />} />
            <Route path="/app/codes" element={<CodesChauffeursPage />} />
            <Route path="/app/motos" element={<MotosPage />} />
            <Route path="/app/proprietaires" element={<ProprietairesPage />} />
            <Route path="/app/courses" element={<CoursesPage />} />
            <Route path="/app/versements" element={<VersementsPage />} />
            <Route path="/app/pointages" element={<PointagesAdminPage />} />
            <Route path="/app/assistance" element={<AssistancePage />} />
            <Route path="/app/contrats" element={<ContratsPage />} />
            <Route path="/app/depenses" element={<DepensesPage />} />
            <Route path="/app/rapports" element={<RapportsPage />} />
            <Route path="/app/messages" element={<MessagesPage />} />
            <Route path="/app/notifications" element={<NotificationsAdminPage />} />
            <Route path="/app/parametres" element={<ParametresPage />} />
            <Route path="/app/utilisateurs" element={<UtilisateursPage />} />
            <Route path="/app/journaux" element={<JournauxPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
