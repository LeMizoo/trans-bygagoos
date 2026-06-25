import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bike, MapPin, TrendingUp, DollarSign, Power, Clock, Plus, Bell } from 'lucide-react';

const API = 'http://localhost:3000/api/v1';
function getToken() { return localStorage.getItem('chauffeur-token'); }
function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }

export function DashboardPage() {
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

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };

  const statutInfo: any = {
    EN_SERVICE: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'En service' },
    EN_PAUSE: { color: '#eab308', bg: 'rgba(234,179,8,0.15)', label: 'En pause' },
    HORS_SERVICE: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'Hors service' },
  };
  const statut = statutInfo[chauffeur?.statut] || statutInfo.HORS_SERVICE;

  const navBtn = (active: boolean) => ({
    flex: 1, padding: '10px 4px', display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', gap: 2, background: 'none', border: 'none',
    color: active ? '#e94560' : '#64748b', cursor: 'pointer', fontSize: 10, fontWeight: active ? 600 : 400,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', paddingBottom: 80, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header avec logo + déconnexion */}
      <div style={{ background: '#1e293b', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/assets/logo/b-trans.png" alt="Logo" style={{ width: 34, height: 34, objectFit: 'contain', borderRadius: 8 }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{chauffeur?.nom || 'Chauffeur'}</div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>{chauffeur?.codeAcces} · {dashboard?.moto?.immatriculation || '-'}</div>
          </div>
        </div>
        {/* Icône déconnexion en haut à droite */}
        <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.15)', border: 'none', width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <Power size={18} color="#f87171" />
        </button>
      </div>

      {/* Statut */}
      <div style={{ padding: '8px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <span style={{ padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statut.bg, color: statut.color }}>
          {statut.label}
        </span>
      </div>

      {/* Solde */}
      <div style={{ margin: '0 16px 16px', padding: 24, borderRadius: 20, background: 'linear-gradient(135deg, #e94560, #c23152)', textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 38, fontWeight: 800, marginTop: 4 }}>{dashboard?.solde?.toLocaleString() || 0} Ar</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 16px' }}>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><MapPin size={18} color="#3b82f6" /></div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Courses</div>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{dashboard?.coursesJour || 0}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>aujourd'hui</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(234,179,8,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><TrendingUp size={18} color="#eab308" /></div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Commission</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#eab308' }}>{dashboard?.commissionJour?.toLocaleString() || 0} Ar</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>20%</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><DollarSign size={18} color="#22c55e" /></div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Gain net</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#22c55e' }}>{dashboard?.gainNetJour?.toLocaleString() || 0} Ar</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>après commission</div>
        </div>
        <div style={{ background: '#1e293b', borderRadius: 16, padding: 16 }}>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: 'rgba(139,92,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}><Clock size={18} color="#8b5cf6" /></div>
          <div style={{ fontSize: 11, color: '#94a3b8' }}>Dernier pointage</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{dashboard?.dernierPointage ? new Date(dashboard.dernierPointage).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' }) : '--:--'}</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>heure</div>
        </div>
      </div>

      {/* Moto */}
      <div style={{ margin: '10px 16px', padding: 14, background: '#1e293b', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Bike size={28} color="#e94560" />
        <div>
          <div style={{ fontWeight: 600, fontSize: 15 }}>{dashboard?.moto?.marque} {dashboard?.moto?.modele}</div>
          <div style={{ fontSize: 12, color: '#94a3b8' }}>{dashboard?.moto?.immatriculation} · {dashboard?.moto?.kmActuel?.toLocaleString()} km</div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', zIndex: 100 }}>
        <button onClick={() => navigate('/dashboard')} style={navBtn(true)}><Bike size={20} /> Accueil</button>
        <button onClick={() => navigate('/pointage')} style={navBtn(false)}><Clock size={20} /> Pointage</button>
        <button onClick={() => navigate('/course')} style={navBtn(false)}><Plus size={20} /> Course</button>
        <button onClick={() => navigate('/versements')} style={navBtn(false)}><DollarSign size={20} /> Versements</button>
        <button onClick={() => navigate('/notifications')} style={navBtn(false)}><Bell size={20} /> Notifs</button>
      </div>
    </div>
  );
}
