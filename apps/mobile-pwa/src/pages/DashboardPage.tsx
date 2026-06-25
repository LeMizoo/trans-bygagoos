import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Play, Pause, StopCircle, RotateCcw, CheckCircle } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const token = () => localStorage.getItem('chauffeur-token') || '';
const chauffeurId = () => JSON.parse(localStorage.getItem('chauffeur') || '{}')?.id;

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const chauffeur = JSON.parse(localStorage.getItem('chauffeur') || '{}');
  const moto = JSON.parse(localStorage.getItem('moto') || 'null');
  const [typeCourse, setTypeCourse] = useState('NORMALE');
  const [kmDepart, setKmDepart] = useState('');
  const [kmArrivee, setKmArrivee] = useState('');
  const [montant, setMontant] = useState('');

  // Dashboard data
  const { data: dash } = useQuery({
    queryKey: ['dashboard', chauffeurId()],
    queryFn: () => axios.get(`${API}/chauffeurs/${chauffeurId()}/dashboard`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data),
    enabled: !!chauffeurId(),
    refetchInterval: 10000,
  });

  // Pointage
  const pointer = useMutation({
    mutationFn: (type: string) => axios.post(`${API}/pointages`, { chauffeurId: chauffeurId(), type }, { headers: { Authorization: `Bearer ${token()}` } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['dashboard'] }); setMsg('✅ Pointage enregistré !'); setTimeout(() => setMsg(''), 3000); },
  });

  // Créer course
  const createCourse = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/courses`, data, { headers: { Authorization: `Bearer ${token()}` } }),
    onSuccess: (res) => {
      setMsg(`✅ Course enregistrée : ${res.data.prix?.toLocaleString()} Ar`);
      setKmDepart(''); setKmArrivee(''); setMontant('');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 3000);
    },
  });

  const handleCourse = () => {
    if (typeCourse === 'NORMALE') {
      const d = parseFloat(kmArrivee) - parseFloat(kmDepart);
      if (d <= 0) { setMsg('⚠️ Km arrivée > Km départ'); return; }
      createCourse.mutate({ chauffeurId: chauffeurId(), motoId: moto?.id, type: 'NORMALE', distance: d });
    } else {
      if (!montant) { setMsg('⚠️ Entrez un montant'); return; }
      createCourse.mutate({ chauffeurId: chauffeurId(), motoId: moto?.id, type: typeCourse, prix: parseFloat(montant) });
    }
  };

  const distance = kmDepart && kmArrivee ? Math.max(0, parseFloat(kmArrivee) - parseFloat(kmDepart)) : 0;
  const prixEstime = distance > 0 ? 2000 + distance * 500 : 0;

  const stats = dash?.aujourdhui || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const semaine = dash?.semaine || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const mois = dash?.mois || { count: 0, prix: 0, commission: 0, gainNet: 0 };

  const statutInfo: Record<string, any> = {
    EN_SERVICE: { color: '#2ecc71', label: 'En service', icon: '🟢' },
    EN_PAUSE: { color: '#f39c12', label: 'En pause', icon: '🟠' },
    HORS_SERVICE: { color: '#e74c3c', label: 'Hors service', icon: '🔴' },
  };
  const s = statutInfo[chauffeur?.statut] || statutInfo.HORS_SERVICE;

  return (
    <div style={{ padding: '80px 12px 80px', maxWidth: 500, margin: '0 auto' }}>
      {msg && (
        <div style={{ position: 'fixed', top: 70, left: '50%', transform: 'translateX(-50%)', background: msg.includes('⚠️') ? '#e74c3c' : '#27ae60', color: '#fff', padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 'bold', zIndex: 2000, maxWidth: '90%', textAlign: 'center' }}>
          {msg}
        </div>
      )}

      {/* Message nouvelle journée */}
      {dash?.messageStatus && (
        <div style={{ background: 'rgba(52,152,219,0.15)', borderLeft: '3px solid #3498db', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#3498db' }}>
          {dash.messageStatus}
        </div>
      )}

      {/* Boutons Début/Standby/Fin */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button onClick={() => pointer.mutate('ARRIVEE')} className="status-btn btn-debut">
          <Play size={20} /> Début
        </button>
        <button onClick={() => pointer.mutate(chauffeur?.statut === 'EN_PAUSE' ? 'REPRISE' : 'PAUSE')} className="status-btn btn-standby">
          <Pause size={20} /> {chauffeur?.statut === 'EN_PAUSE' ? 'Reprendre' : 'Standby'}
        </button>
        <button onClick={() => setShowConfirm(true)} className="status-btn btn-fin">
          <StopCircle size={20} /> Fin
        </button>
      </div>

      {/* Stats Aujourd'hui */}
      <div className="card">
        <div className="card-title">📅 Aujourd'hui</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{stats.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{stats.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{stats.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: stats.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{stats.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      {/* Formulaire course */}
      <div className="card">
        <div className="card-title">➕ Nouvelle course</div>
        <div className="form-group">
          <label>Type</label>
          <select value={typeCourse} onChange={e => setTypeCourse(e.target.value)}>
            <option value="NORMALE">🚖 Course normale</option>
            <option value="ADY_VAROTRA">🛺 Ady Varotra</option>
            <option value="LOCATION_JOURNALIERE">📅 Location journalière</option>
          </select>
        </div>
        {typeCourse === 'NORMALE' ? (
          <>
            <div className="form-group">
              <label>📍 Km départ</label>
              <input type="number" step="0.1" value={kmDepart} onChange={e => setKmDepart(e.target.value)} placeholder="Ex: 12345.5" />
            </div>
            <div className="form-group">
              <label>📍 Km arrivée</label>
              <input type="number" step="0.1" value={kmArrivee} onChange={e => setKmArrivee(e.target.value)} placeholder="Ex: 12355.5" />
            </div>
            {distance > 0 && (
              <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center', fontSize: 12, marginBottom: 8 }}>
                📏 Distance : {distance.toFixed(1)} km &nbsp;|&nbsp; 💰 {prixEstime.toLocaleString()} Ar
              </div>
            )}
          </>
        ) : (
          <div className="form-group">
            <label>💰 Montant (Ar)</label>
            <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Ex: 50000" />
          </div>
        )}
        <button onClick={handleCourse} disabled={createCourse.isPending} className="btn-primary">
          {createCourse.isPending ? '⏳ Enregistrement...' : '✅ Enregistrer'}
        </button>
      </div>

      {/* Stats Semaine */}
      <div className="card">
        <div className="card-title">📅 Cette semaine</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{semaine.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{semaine.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{semaine.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: semaine.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{semaine.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      {/* Stats Mois */}
      <div className="card">
        <div className="card-title">📅 Ce mois</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{mois.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{mois.prix.toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{mois.commission.toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: mois.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{mois.gainNet.toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      {/* Solde */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)', borderColor: '#DAA520' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: '#DAA520', marginTop: 4 }}>{dash?.solde?.toLocaleString() || 0} Ar</div>
        </div>
      </div>

      {/* Modal confirmation Fin */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 24, maxWidth: 320, width: '100%', textAlign: 'center', border: '1px solid #DAA520' }}>
            <StopCircle size={48} color="#e74c3c" style={{ marginBottom: 12 }} />
            <h3 style={{ color: '#DAA520', fontSize: 16, marginBottom: 8 }}>Terminer la journée ?</h3>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>Vous ne pourrez plus enregistrer de courses aujourd'hui sans l'autorisation de l'administrateur.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 12, background: '#333', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={() => { pointer.mutate('FIN_SERVICE'); setShowConfirm(false); }} style={{ flex: 1, padding: 12, background: '#e74c3c', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
