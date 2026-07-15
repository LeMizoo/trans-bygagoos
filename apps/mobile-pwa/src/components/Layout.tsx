/* eslint-disable @typescript-eslint/no-explicit-any */
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Bell, LogOut, Home, History, HandCoins, BarChart3, User } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }
function getToken() { return localStorage.getItem('chauffeur-token'); }

export function Layout() {
  const chauffeur = getChauffeur();
  const token = getToken();
  const navigate = useNavigate();
  const location = useLocation();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    window.addEventListener('online', () => setOnline(true));
    window.addEventListener('offline', () => setOnline(false));
  }, []);

  useQuery({
    queryKey: ['dashboard', chauffeur?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${chauffeur?.id}/dashboard`, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.data),
    enabled: !!chauffeur?.id,
    refetchInterval: 10000,
  });

  const statutInfo: Record<string, any> = {
    EN_SERVICE: { color: '#2ecc71', label: 'En service' },
    EN_PAUSE: { color: '#f39c12', label: 'En pause' },
    HORS_SERVICE: { color: '#e74c3c', label: 'Hors service' },
  };
  const s = statutInfo[chauffeur?.statut] || statutInfo.HORS_SERVICE;

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const tabs = [
    { path: '/dashboard', icon: Home, label: 'Accueil' },
    { path: '/courses', icon: History, label: 'Courses' },
    { path: '/versements', icon: HandCoins, label: 'Versements' },
    { path: '/stats', icon: BarChart3, label: 'Stats' },
    { path: '/profil', icon: User, label: 'Profil' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#fff', paddingBottom: 70, fontFamily: 'system-ui, sans-serif' }}>
      {/* HEADER */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', borderBottom: '1px solid #DAA520', padding: '8px 12px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 500, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#DAA520' }}>{chauffeur?.nom || 'Chauffeur'}</div>
              <div style={{ fontSize: 9, color: '#888', display: 'flex', gap: 4 }}>
                <span style={{ background: s.color + '20', color: s.color, padding: '1px 5px', borderRadius: 8, fontSize: 8 }}>{s.label}</span>
                <span>{chauffeur?.codeAcces}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            <button style={iconBtn('rgba(255,255,255,0.1)', '#DAA520')}><Bell size={14} /></button>
            <button onClick={handleLogout} style={iconBtn('rgba(231,76,60,0.2)', '#e74c3c')}><LogOut size={14} /></button>
            <button style={iconBtn(online ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)', online ? '#2ecc71' : '#e74c3c')}>
              {online ? <Wifi size={14} /> : <WifiOff size={14} />}
            </button>
          </div>
        </div>
      </div>

      {/* CONTENU */}
      <div style={{ paddingTop: 56, maxWidth: 500, margin: '0 auto' }}>
        <Outlet />
      </div>

      {/* NAVIGATION BASSE */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111', borderTop: '1px solid #2a2a2a', padding: '4px 8px 8px', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 500, margin: '0 auto' }}>
          {tabs.map(t => {
            const active = location.pathname === t.path;
            return (
              <button key={t.path} onClick={() => navigate(t.path)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: 'none', border: 'none', color: active ? '#DAA520' : '#666', fontSize: 9, cursor: 'pointer', padding: '4px 8px' }}>
                <t.icon size={18} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function iconBtn(bg: string, color: string) {
  return { background: bg, border: 'none', width: 28, height: 28, borderRadius: '50%', color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' };
}
