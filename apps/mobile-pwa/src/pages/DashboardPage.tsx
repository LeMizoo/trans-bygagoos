import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Play, Pause, StopCircle } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const token = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

export function DashboardPage() {
  const queryClient = useQueryClient();
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [typeCourse, setTypeCourse] = useState('NORMALE');
  const [kmDepart, setKmDepart] = useState('');
  const [kmArrivee, setKmArrivee] = useState('');
  const [montant, setMontant] = useState('');

  const c = chauffeur();
  const m = moto();

  const { data: dash } = useQuery({
    queryKey: ['dashboard', c?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${c?.id}/dashboard`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data),
    enabled: !!c?.id,
    refetchInterval: 10000,
  });

  const pointer = useMutation({
    mutationFn: (type: string) => axios.post(`${API}/pointages`, { chauffeurId: c?.id, type }, { headers: { Authorization: `Bearer ${token()}` } }),
    onSuccess: (_, type) => {
      const labels: Record<string, string> = { ARRIVEE: '✅ Début enregistré !', PAUSE: '⏸️ Pause enregistrée', REPRISE: '🔄 Reprise enregistrée', FIN_SERVICE: '🏁 Service terminé !' };
      setMsg(labels[type] || '✅ OK');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (err: any) => setMsg('❌ ' + (err?.response?.data?.message || 'Erreur')),
  });

  const createCourse = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/courses`, data, { headers: { Authorization: `Bearer ${token()}` } }),
    onSuccess: (res) => {
      setMsg('✅ Course : ' + res.data.prix?.toLocaleString() + ' Ar');
      setKmDepart(''); setKmArrivee(''); setMontant('');
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (err: any) => setMsg('❌ ' + (err?.response?.data?.message || 'Erreur')),
  });

  const handleCourse = () => {
    if (typeCourse === 'NORMALE') {
      const d = parseFloat(kmArrivee) - parseFloat(kmDepart);
      if (d <= 0) { setMsg('⚠️ Km arrivée > Km départ'); return; }
      createCourse.mutate({ chauffeurId: c?.id, motoId: m?.id, type: 'NORMALE', distance: d });
    } else {
      if (!montant) { setMsg('⚠️ Entrez un montant'); return; }
      createCourse.mutate({ chauffeurId: c?.id, motoId: m?.id, type: typeCourse, prix: parseFloat(montant) });
    }
  };

  const distance = kmDepart && kmArrivee ? Math.max(0, parseFloat(kmArrivee) - parseFloat(kmDepart)) : 0;
  const prixEstime = distance > 0 ? 2000 + distance * 500 : 0;
  const stats = dash?.aujourdhui || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const semaine = dash?.semaine || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const mois = dash?.mois || { count: 0, prix: 0, commission: 0, gainNet: 0 };
  const statut = c?.statut;

  return (
    <div style={{ padding: '8px 12px' }}>
      {msg && <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: msg.includes('❌') || msg.includes('⚠️') ? '#e74c3c' : '#27ae60', color: '#fff', padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 'bold', zIndex: 2000, whiteSpace: 'nowrap' }}>{msg}</div>}

      {/* Boutons Début/Standby/Fin */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button onClick={() => pointer.mutate('ARRIVEE')} style={btnStyle('#2ecc71', '#fff')}><Play size={18} /> Début</button>
        <button onClick={() => pointer.mutate(statut === 'EN_PAUSE' ? 'REPRISE' : 'PAUSE')} style={btnStyle('#f39c12', '#000')}><Pause size={18} /> {statut === 'EN_PAUSE' ? 'Reprendre' : 'Standby'}</button>
        <button onClick={() => setShowConfirm(true)} style={btnStyle('#e74c3c', '#fff')}><StopCircle size={18} /> Fin</button>
      </div>

      {/* Message nouvelle journée */}
      {dash?.messageStatus && <div style={{ background: 'rgba(52,152,219,0.15)', borderLeft: '3px solid #3498db', padding: 8, borderRadius: 6, marginBottom: 10, fontSize: 11, color: '#3498db' }}>{dash.messageStatus}</div>}

      {/* Stats Aujourd'hui */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, border: '1px solid #2a2a2a' }}>
        <div style={{ color: '#DAA520', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📅 Aujourd'hui</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: '#DAA520' }}>{stats.count}</div><div style={{ fontSize: 8, color: '#888' }}>Courses</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: '#DAA520' }}>{stats.prix.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>CA</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: '#eab308' }}>{stats.commission.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Commission</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 16, fontWeight: 'bold', color: stats.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{stats.gainNet.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Gain net</div></div>
        </div>
      </div>

      {/* Formulaire course */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, border: '1px solid #2a2a2a' }}>
        <div style={{ color: '#DAA520', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>➕ Nouvelle course</div>
        <div style={{ marginBottom: 8 }}>
          <select value={typeCourse} onChange={e => setTypeCourse(e.target.value)} style={{ width: '100%', padding: 8, background: '#252525', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }}>
            <option value="NORMALE">🚖 Course normale</option>
            <option value="ADY_VAROTRA">🛺 Ady Varotra</option>
            <option value="LOCATION_JOURNALIERE">📅 Location journalière</option>
          </select>
        </div>
        {typeCourse === 'NORMALE' ? (
          <>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input type="number" step="0.1" value={kmDepart} onChange={e => setKmDepart(e.target.value)} placeholder="Km départ" style={{ flex: 1, padding: 8, background: '#252525', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }} />
              <input type="number" step="0.1" value={kmArrivee} onChange={e => setKmArrivee(e.target.value)} placeholder="Km arrivée" style={{ flex: 1, padding: 8, background: '#252525', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }} />
            </div>
            {distance > 0 && <div style={{ background: '#252525', borderRadius: 6, padding: 6, textAlign: 'center', fontSize: 11, marginBottom: 6 }}>📏 {distance.toFixed(1)} km · 💰 {prixEstime.toLocaleString()} Ar</div>}
          </>
        ) : (
          <div style={{ marginBottom: 6 }}>
            <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant (Ar)" style={{ width: '100%', padding: 8, background: '#252525', border: '1px solid #333', borderRadius: 8, color: '#fff', fontSize: 12 }} />
          </div>
        )}
        <button onClick={handleCourse} disabled={createCourse.isPending} style={{ width: '100%', padding: 10, background: '#DAA520', color: '#000', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 'bold', cursor: 'pointer' }}>
          {createCourse.isPending ? '⏳...' : '✅ Enregistrer'}
        </button>
      </div>

      {/* Stats Semaine */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, border: '1px solid #2a2a2a' }}>
        <div style={{ color: '#DAA520', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📅 Cette semaine</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: '#DAA520' }}>{semaine.count}</div><div style={{ fontSize: 8, color: '#888' }}>Courses</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: '#DAA520' }}>{semaine.prix.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>CA</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: '#eab308' }}>{semaine.commission.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Commission</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: semaine.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{semaine.gainNet.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Gain net</div></div>
        </div>
      </div>

      {/* Stats Mois */}
      <div style={{ background: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10, border: '1px solid #2a2a2a' }}>
        <div style={{ color: '#DAA520', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>📅 Ce mois</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: '#DAA520' }}>{mois.count}</div><div style={{ fontSize: 8, color: '#888' }}>Courses</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: '#DAA520' }}>{mois.prix.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>CA</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: '#eab308' }}>{mois.commission.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Commission</div></div>
          <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center' }}><div style={{ fontSize: 14, fontWeight: 'bold', color: mois.gainNet >= 0 ? '#27ae60' : '#e74c3c' }}>{mois.gainNet.toLocaleString()} Ar</div><div style={{ fontSize: 8, color: '#888' }}>Gain net</div></div>
        </div>
      </div>

      {/* Solde */}
      <div style={{ background: 'linear-gradient(135deg, #1a1a1a, #DAA52022)', borderRadius: 12, padding: 16, textAlign: 'center', border: '1px solid #DAA520', marginBottom: 10 }}>
        <div style={{ fontSize: 10, color: '#DAA520', letterSpacing: 2 }}>SOLDE ACTUEL</div>
        <div style={{ fontSize: 30, fontWeight: 800, color: '#DAA520' }}>{dash?.solde?.toLocaleString() || 0} Ar</div>
      </div>

      {/* Modal Confirmation Fin */}
      {showConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, padding: 20 }}>
          <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 24, maxWidth: 300, width: '100%', textAlign: 'center', border: '1px solid #DAA520' }}>
            <StopCircle size={40} color="#e74c3c" style={{ marginBottom: 10 }} />
            <h3 style={{ color: '#DAA520', fontSize: 15, marginBottom: 6 }}>Terminer la journée ?</h3>
            <p style={{ color: '#888', fontSize: 11, marginBottom: 16 }}>Vous ne pourrez plus enregistrer de courses sans l'autorisation de l'administrateur.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowConfirm(false)} style={{ flex: 1, padding: 10, background: '#333', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Annuler</button>
              <button onClick={() => { pointer.mutate('FIN_SERVICE'); setShowConfirm(false); }} style={{ flex: 1, padding: 10, background: '#e74c3c', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function btnStyle(bg: string, color: string) {
  return { flex: 1, padding: '10px 6px', background: bg, border: 'none', borderRadius: 10, color, fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', flexDirection: 'column' as const, alignItems: 'center', gap: 2 };
}
