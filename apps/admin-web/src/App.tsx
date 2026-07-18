import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { DashboardPage } from './pages/private/DashboardPage';
import { FlottesAdminPage } from './pages/private/FlottesAdminPage';
import { CoopsAdminPage } from './pages/private/CoopsAdminPage';
import { AbonnementsPage } from './pages/private/AbonnementsPage';
import { ParametresPage } from './pages/private/ParametresPage';
import { ChauffeursPage } from './pages/ChauffeursPage';
import { LivreursPage } from './pages/private/LivreursPage';
import { VehiculesPage } from './pages/private/VehiculesPage';
import { CommandesPage } from './pages/private/CommandesPage';
import { CoursesPage } from './pages/CoursesPage';
import { DepensesPage } from './pages/DepensesPage';
import { VersementsPage } from './pages/VersementsPage';
import { RapportsPage } from './pages/RapportsPage';
import { AssistancePage } from './pages/AssistancePage';
import { NotificationsAdminPage } from './pages/NotificationsAdminPage';
import { LogsPage } from './pages/private/LogsPage';
import { UtilisateursPage } from './pages/UtilisateursPage';
import { ProprietaireDetailsPage } from './pages/ProprietaireDetailsPage';
import { Layout } from './components/common/Layout';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Dashboard */}
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Gestion */}
        <Route path="/flottes" element={<FlottesAdminPage />} />
        <Route path="/flottes/:id" element={<ProprietaireDetailsPage />} />
        <Route path="/coops" element={<CoopsAdminPage />} />
        <Route path="/chauffeurs" element={<ChauffeursPage />} />
        <Route path="/livreurs" element={<LivreursPage />} />
        <Route path="/vehicules" element={<VehiculesPage />} />
        <Route path="/commandes" element={<CommandesPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        
        {/* Finances */}
        <Route path="/depenses" element={<DepensesPage />} />
        <Route path="/versements" element={<VersementsPage />} />
        <Route path="/abonnements" element={<AbonnementsPage />} />
        
        {/* Support & Monitoring */}
        <Route path="/assistance" element={<AssistancePage />} />
        <Route path="/notifications" element={<NotificationsAdminPage />} />
        <Route path="/logs" element={<LogsPage />} />
        <Route path="/rapports" element={<RapportsPage />} />
        
        {/* Administration */}
        <Route path="/parametres" element={<ParametresPage />} />
        <Route path="/utilisateurs" element={<UtilisateursPage />} />
        
        {/* Redirections */}
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
