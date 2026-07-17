import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './stores/authStore';
import LoginPage from './pages/LoginPage';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import StatsPage from './pages/StatsPage';
import FinancesPage from './pages/FinancesPage';
import ProfilPage from './pages/ProfilPage';
import NotificationsPage from './pages/NotificationsPage';
import NotificationsPopup from './components/NotificationsPopup';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function AppContent() {
  const { isLoggedIn, page, showNotif, setPage, setShowNotif } = useAuth();

  if (!isLoggedIn) return <LoginPage />;

  return (
    <>
      <Header onNotifications={() => setShowNotif(!showNotif)} />
      <div className="main-content">
        {page !== 'accueil' && (
          <div className="page-title">
            {{
              courses: '📋 Mes courses',
              stats: '📊 Statistiques',
              versements: '💰 Versements',
              profil: '👤 Mon profil',
            }[page]}
          </div>
        )}
        {page === 'accueil' && <DashboardPage />}
        {page === 'courses' && <CoursesPage />}
        {page === 'versements' && <FinancesPage />}
        {page === 'stats' && <StatsPage />}
        {page === 'profil' && <ProfilPage />}
        {page === 'notifications' && <NotificationsPage onBack={() => setPage('accueil')} />}
      </div>
      {showNotif && (
        <NotificationsPopup
          onClose={() => setShowNotif(false)}
          onViewAll={() => { setShowNotif(false); setPage('notifications'); }}
        />
      )}
      <BottomNav current={page} onChange={setPage} />
    </>
  );
}
