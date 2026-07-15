import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../stores/authStore';
import apiClient from '../api/client';
import FinJourModal from '../components/FinJourModal';

export default function DashboardPage() {
  const qc = useQueryClient();
  const { chauffeur, moto } = useAuth();
  const [msg, setMsg] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [typeCourse, setTypeCourse] = useState('NORMALE');
  const [kmDepart, setKmDepart] = useState('');
  const [kmArrivee, setKmArrivee] = useState('');
  const [montant, setMontant] = useState('');
  const [kmDebut, setKmDebut] = useState(localStorage.getItem('kmDebut') || '');
  const [distanceJour, setDistanceJour] = useState(0);

  const enService = chauffeur?.statut === 'EN_SERVICE';

  const { data: params } = useQuery({
    queryKey: ['parametres'],
    queryFn: () => apiClient.get('/parametres').then(r => r.data).catch(() => ({
      prix_base: 2000, prix_km: 500, tarif_location_journalier: 15000
    })),
    staleTime: 300000,
  });

  const { data: dash } = useQuery({
    queryKey: ['dashboard', chauffeur?.id],
    queryFn: () => apiClient.get(`/chauffeurs/${chauffeur?.id}/dashboard`).then(r => r.data),
    enabled: !!chauffeur?.id,
    refetchInterval: 10000,
  });

  const pointer = useMutation({
    mutationFn: (type: string) =>
      apiClient.post('/pointages', {
        chauffeurId: chauffeur?.id,
        type,
        kmDebut: kmDebut || undefined,
      }),
    onSuccess: (_, type) => {
      const cd = JSON.parse(localStorage.getItem('chauffeur') || '{}');
      cd.statut = type === 'ARRIVEE' || type === 'REPRISE' ? 'EN_SERVICE'
        : type === 'PAUSE' ? 'EN_PAUSE' : 'HORS_SERVICE';
      localStorage.setItem('chauffeur', JSON.stringify(cd));
      setMsg(
        type === 'ARRIVEE' ? '✅ Service débuté !'
        : type === 'PAUSE' ? '⏸️ Pause'
        : type === 'REPRISE' ? '🔄 Reprise'
        : `🏁 Service terminé - ${distanceJour.toFixed(1)} km parcourus`
      );
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 2000);
    },
  });

  const createCourse = useMutation({
    mutationFn: (data: any) => apiClient.post('/courses', data),
    onSuccess: () => {
      setMsg('✅ Course enregistrée');
      setKmDepart(''); setKmArrivee(''); setMontant('');
      qc.invalidateQueries({ queryKey: ['dashboard'] });
      setTimeout(() => setMsg(''), 1500);
    },
    onError: (err: any) => setMsg('❌ ' + (err?.response?.data?.message || 'Erreur')),
  });

  const handleCourse = () => {
    if (!enService) { setMsg('❌ Vous devez être EN SERVICE'); return; }
    if (typeCourse === 'LOCATION_JOURNALIERE') {
      createCourse.mutate({ chauffeurId: chauffeur?.id, motoId: moto?.id, type: 'LOCATION_JOURNALIERE', prix: params?.tarif_location_journalier || 15000 });
    } else if (typeCourse === 'TOUR') {
      const nbPassagers = prompt('👥 Nombre de passagers:');
      if (!nbPassagers || parseInt(nbPassagers) <= 0) { setMsg('⚠️ Entrez le nombre de passagers'); return; }
      const tarifPassager = prompt('💵 Tarif par passager (Ar):');
      if (!tarifPassager || parseInt(tarifPassager) <= 0) { setMsg('⚠️ Entrez le tarif'); return; }
      createCourse.mutate({ chauffeurId: chauffeur?.id, motoId: moto?.id, type: 'TOUR', prix: parseInt(nbPassagers) * parseInt(tarifPassager), nbPassagers: parseInt(nbPassagers) });
    } else if (typeCourse === 'FORFAIT') {
      if (!montant) { setMsg('⚠️ Entrez un montant'); return; }
      createCourse.mutate({ chauffeurId: chauffeur?.id, motoId: moto?.id, type: 'FORFAIT', prix: parseFloat(montant) });
    } else if (typeCourse === 'NORMALE') {
      const d = parseFloat(kmArrivee) - parseFloat(kmDepart);
      if (d <= 0) { setMsg('⚠️ Km arrivée > Km départ'); return; }
      createCourse.mutate({ chauffeurId: chauffeur?.id, motoId: moto?.id, type: 'NORMALE', distance: d });
    } else {
      if (!montant) { setMsg('⚠️ Entrez un montant'); return; }
      createCourse.mutate({ chauffeurId: chauffeur?.id, motoId: moto?.id, type: 'ADY_VAROTRA', prix: parseFloat(montant) });
    }
  };

  const addDepense = (cat: string, label: string) => {
    const mt = prompt(`${label} (Ar):`);
    if (mt && parseFloat(mt) > 0) {
      const extra: any = {};
      if (cat === 'CARBURANT') { const l = prompt('Litres (optionnel):'); if (l) extra.litres = parseFloat(l); const s = prompt('Station (optionnelle):'); if (s) extra.station = s; }
      if (cat === 'REPARATION') { const d = prompt('Description:'); if (d) extra.description = d; }
      apiClient.post('/depenses', { description: label, montant: parseFloat(mt), categorie: cat, motoId: moto?.id, ...extra })
        .then(() => { alert('✅ Déclaré !'); qc.invalidateQueries({ queryKey: ['dashboard'] }); })
        .catch(() => alert('❌ Erreur'));
    }
  };

  const distance = kmDepart && kmArrivee ? Math.max(0, parseFloat(kmArrivee) - parseFloat(kmDepart)) : 0;
  const stats = { count: 0, prix: 0, commission: 0, gainNet: 0, ...(dash?.aujourdhui ?? {}) };
  const semaine = { count: 0, prix: 0, commission: 0, gainNet: 0, ...(dash?.semaine ?? {}) };
  const mois = { count: 0, prix: 0, commission: 0, gainNet: 0, ...(dash?.mois ?? {}) };

  return (
    <div>
      {msg && <div className={`floating-alert ${msg.includes('✅') ? 'success' : 'warning'}`}>{msg}</div>}

      <div className="status-buttons">
        <button onClick={() => {
          const horsService = !chauffeur?.statut || chauffeur.statut === 'HORS_SERVICE';
          if (horsService) {
            const km = prompt('🏍️ KM au compteur au départ:');
            if (km) { setKmDebut(km); localStorage.setItem('kmDebut', km); pointer.mutate('ARRIVEE'); }
          } else { pointer.mutate('ARRIVEE'); }
        }} className="status-btn debut">▶️ Début</button>
        <button onClick={() => pointer.mutate(chauffeur?.statut === 'EN_PAUSE' ? 'REPRISE' : 'PAUSE')} className="status-btn standby">
          {chauffeur?.statut === 'EN_PAUSE' ? '▶️ Reprendre' : '⏸️ Standby'}
        </button>
        <button onClick={() => setShowConfirm(true)} className="status-btn fin">⏹️ Fin</button>
      </div>

      {kmDebut && (
        <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center', fontSize: 12, marginBottom: 8 }}>
          🏍️ KM départ: <strong style={{ color: '#DAA520' }}>{kmDebut}</strong>
        </div>
      )}

      <div className="card">
        <div className="card-title">📅 Aujourd'hui</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{stats.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{(stats.prix || 0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{(stats.commission || 0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: (stats.gainNet || 0) >= 0 ? '#27ae60' : '#e74c3c' }}>{(stats.gainNet || 0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">➕ Nouvelle course</div>
        {!enService && (
          <div style={{ background: 'rgba(239,68,68,0.1)', borderLeft: '3px solid #ef4444', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#ef4444' }}>
            🔒 Vous devez être EN SERVICE
          </div>
        )}
        <div className="form-group">
          <select value={typeCourse} onChange={e => setTypeCourse(e.target.value)} disabled={!enService}
            style={{ width: '100%', padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13, opacity: enService ? 1 : 0.5 }}>
            {moto?.typeVehicule === 'BUS' ? (
              <option value='TOUR'>🚌 Tour (aller-retour)</option>
            ) : moto?.typeVehicule === 'TAXI' ? (
              <><option value='NORMALE'>🚗 Course (km)</option><option value='FORFAIT'>🚗 Forfait</option></>
            ) : (
              <><option value='NORMALE'>🏍️ Course (km)</option><option value='ADY_VAROTRA'>🛺 Ady Varotra</option><option value='LOCATION_JOURNALIERE'>📅 Location journée</option></>
            )}
          </select>
        </div>

        {typeCourse === 'TOUR' && (
          <div style={{ background: '#1a2a1a', borderRadius: 10, padding: 15, textAlign: 'center', marginBottom: 8, border: '1px solid #2ecc71' }}>
            <div style={{ fontSize: 11, color: '#888' }}>🚌 Tour = Aller + Retour</div>
            <div style={{ fontSize: 14, color: '#2ecc71' }}>Prix = Passagers × Tarif unitaire</div>
          </div>
        )}

        {typeCourse === 'NORMALE' && (
          <div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <input type="number" step="0.1" value={kmDepart} onChange={e => setKmDepart(e.target.value)} placeholder="Km départ" disabled={!enService}
                style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }} />
              <input type="number" step="0.1" value={kmArrivee} onChange={e => setKmArrivee(e.target.value)} placeholder="Km arrivée" disabled={!enService}
                style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }} />
            </div>
            {distance > 0 && (
              <div style={{ background: '#252525', borderRadius: 8, padding: 8, textAlign: 'center', fontSize: 12, marginBottom: 8 }}>
                📏 {distance.toFixed(1)} km · 💰 {((params?.prix_base || 2000) + distance * (params?.prix_km || 500)).toLocaleString()} Ar
              </div>
            )}
          </div>
        )}

        {typeCourse === 'LOCATION_JOURNALIERE' && (
          <div style={{ background: '#1a2a1a', borderRadius: 10, padding: 15, textAlign: 'center', marginBottom: 8, border: '1px solid #2ecc71' }}>
            <div style={{ fontSize: 11, color: '#888' }}>📅 Tarif location journalière</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#2ecc71' }}>{(params?.tarif_location_journalier || 15000).toLocaleString()} Ar</div>
          </div>
        )}

        {(typeCourse === 'FORFAIT' || typeCourse === 'ADY_VAROTRA') && (
          <div className="form-group">
            <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
              placeholder={typeCourse === 'FORFAIT' ? 'Montant du forfait (Ar)' : 'Montant (Ar)'} disabled={!enService}
              style={{ width: '100%', padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }} />
          </div>
        )}

        <button onClick={handleCourse} disabled={!enService || createCourse.isPending} className="btn-primary" style={{ opacity: enService ? 1 : 0.5 }}>
          {createCourse.isPending ? '⏳...' : '✅ Enregistrer'}
        </button>

        {enService && (
          <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button onClick={() => addDepense('CARBURANT', 'Carburant')}
              style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, color: '#f87171', fontSize: 11, cursor: 'pointer' }}>⛽ Carburant</button>
            <button onClick={() => addDepense('PNEU', 'Pneu')}
              style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, color: '#f87171', fontSize: 11, cursor: 'pointer' }}>🛞 Pneu</button>
            <button onClick={() => addDepense('REPARATION', 'Réparation')}
              style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 20, color: '#f87171', fontSize: 11, cursor: 'pointer' }}>🔨 Réparation</button>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-title">📆 Cette semaine</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{semaine.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{(semaine.prix || 0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{(semaine.commission || 0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: (semaine.gainNet || 0) >= 0 ? '#27ae60' : '#e74c3c' }}>{(semaine.gainNet || 0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      <div className="card">
        <div className="card-title">📅 Ce mois</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value">{mois.count}</div><div className="stat-label">Courses</div></div>
          <div className="stat-item"><div className="stat-value">{(mois.prix || 0).toLocaleString()} Ar</div><div className="stat-label">CA</div></div>
          <div className="stat-item"><div className="stat-value">{(mois.commission || 0).toLocaleString()} Ar</div><div className="stat-label">Commission</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: (mois.gainNet || 0) >= 0 ? '#27ae60' : '#e74c3c' }}>{(mois.gainNet || 0).toLocaleString()} Ar</div><div className="stat-label">Gain net</div></div>
        </div>
      </div>

      {showConfirm && (
        <FinJourModal
          kmDebut={kmDebut}
          distanceJour={distanceJour}
          setDistanceJour={setDistanceJour}
          setShowConfirm={setShowConfirm}
          pointer={pointer}
        />
      )}
    </div>
  );
}
