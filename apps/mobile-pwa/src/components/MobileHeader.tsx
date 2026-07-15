/* eslint-disable @typescript-eslint/no-explicit-any */
import { Power } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';
function getToken() { return localStorage.getItem('chauffeur-token'); }
function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }

export function MobileHeader() {
  const chauffeur = getChauffeur();
  const navigate = useNavigate();

  const { data: dashboard } = useQuery({
    queryKey: ['dashboard', chauffeur?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${chauffeur?.id}/dashboard`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.data),
    enabled: !!chauffeur?.id,
    refetchInterval: 10000,
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const statutInfo: any = {
    EN_SERVICE: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'En service' },
    EN_PAUSE: { color: '#eab308', bg: 'rgba(234,179,8,0.15)', label: 'En pause' },
    HORS_SERVICE: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Hors service' },
  };
  const statut = statutInfo[chauffeur?.statut] || statutInfo.HORS_SERVICE;

  return (
    <div style={{ background: '#1e293b', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 8 }} />
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{chauffeur?.nom || 'Chauffeur'}</div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>{chauffeur?.codeAcces} · {dashboard?.moto?.immatriculation || '-'}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, background: statut.bg, color: statut.color }}>
          {statut.label}
        </span>
        <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Power size={16} color="#f87171" />
        </button>
      </div>
    </div>
  );
}
