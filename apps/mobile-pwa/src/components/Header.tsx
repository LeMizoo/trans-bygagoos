import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Wifi, WifiOff, Bell, LogOut, RotateCw } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function Header() {
  const chauffeur = JSON.parse(localStorage.getItem('chauffeur') || '{}');
  const token = localStorage.getItem('chauffeur-token');
  const moto = JSON.parse(localStorage.getItem('moto') || 'null');
  const [online, setOnline] = React.useState(navigator.onLine);
  const [notifCount, setNotifCount] = React.useState(0);

  React.useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Charger le compteur de notifications
  React.useEffect(() => {
    if (!token || !online) return;
    axios.get(`${API}/notifications/count`).then(r => setNotifCount(r.data || 0)).catch(() => {});
    const interval = setInterval(() => {
      axios.get(`${API}/notifications/count`).then(r => setNotifCount(r.data || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [token, online]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.reload();
  };

  const statutInfo: Record<string, any> = {
    EN_SERVICE: { color: '#2ecc71', label: 'En service' },
    EN_PAUSE: { color: '#f39c12', label: 'En pause' },
    HORS_SERVICE: { color: '#e74c3c', label: 'Hors service' },
  };
  const s = statutInfo[chauffeur?.statut] || statutInfo.HORS_SERVICE;

  return (
    <div style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #0d0d0d 100%)', borderBottom: '1px solid #DAA520', padding: '10px 12px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 500, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 36, height: 36, objectFit: 'contain' }} />
          <div>
            <h1 style={{ fontSize: 14, color: '#DAA520', margin: 0 }}>{chauffeur?.nom || 'Chauffeur'}</h1>
            <p style={{ fontSize: 10, color: '#888', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 6px', borderRadius: 10, fontSize: 9, fontWeight: 'bold', background: s.color + '20', color: s.color }}>{s.label}</span>
              {moto ? <span style={{ background: '#2a2a2a', padding: '2px 6px', borderRadius: 10, fontSize: 9, color: '#DAA520' }}>🏍️ {moto.immatriculation}</span> : <span style={{ background: '#e74c3c', padding: '2px 6px', borderRadius: 10, fontSize: 9, color: '#fff', animation: 'pulse 1.5s infinite' }}>⚠️ Pas de moto</span>}
              <span style={{ fontSize: 10 }}>🔑 {chauffeur?.codeAcces}</span>
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button style={{ background: 'rgba(52,152,219,0.2)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: '#3498db', cursor: 'pointer', position: 'relative' }} title="Sync">
            <RotateCw size={16} />
          </button>
          <button style={{ background: 'rgba(255,255,255,0.1)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: '#DAA520', cursor: 'pointer', position: 'relative' }} title="Notifications">
            <Bell size={16} />
            {notifCount > 0 && <span style={{ position: 'absolute', top: -4, right: -4, background: '#e74c3c', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{notifCount}</span>}
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(231,76,60,0.2)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: '#e74c3c', cursor: 'pointer' }} title="Déconnexion">
            <LogOut size={16} />
          </button>
          <button style={{ background: online ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)', border: 'none', width: 32, height: 32, borderRadius: '50%', color: online ? '#2ecc71' : '#e74c3c', cursor: 'pointer' }} title={online ? 'En ligne' : 'Hors ligne'}>
            {online ? <Wifi size={16} /> : <WifiOff size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
