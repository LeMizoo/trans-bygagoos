import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginPage } from './pages/public/LoginPage';
import { DashboardPage } from './pages/private/DashboardPage';
import { ChauffeursPage } from './pages/private/ChauffeursPage';
import { CoursesPage } from './pages/CoursesPage';
import { DepensesPage } from './pages/DepensesPage';
import { VersementsPage } from './pages/VersementsPage';
import { RapportsPage } from './pages/RapportsPage';
import { ParametresPage } from './pages/ParametresPage';
import { MotosPage } from './pages/MotosPage';
import { Layout } from './components/common/Layout';

function AppRoutes() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;
  if (!user) return <Routes><Route path="*" element={<LoginPage />} /></Routes>;
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chauffeurs" element={<ChauffeursPage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/depenses" element={<DepensesPage />} />
        <Route path="/versements" element={<VersementsPage />} />
        <Route path="/rapports" element={<RapportsPage />} />
        <Route path="/parametres" element={<ParametresPage />} />
        <Route path="/vehicules" element={<MotosPage />} />
        <Route path="*" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
