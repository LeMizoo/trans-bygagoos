import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';
const token = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

/* eslint-disable @typescript-eslint/no-explicit-any */
export function VersementsPage() {
  const c = chauffeur();
  const qc = useQueryClient();
  const [montant, setMontant] = useState('');
  const [msg, setMsg] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showPayment, setShowPayment] = useState(false);

  const { data } = useQuery({
    queryKey: ['versements', c?.id],
    queryFn: () => axios.get(`${API}/versements/chauffeur/${c?.id}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });

  const resume = data?.resume || { totalDu: 0, totalVerse: 0, resteAPayer: 0, gainNetJour: 0, disponible: 0, montantSuggere: 0 };
  const impayes = data?.impayes || [];
  const versements = data?.versements || [];

  const totalSelected = Array.from(selectedIds).reduce((s, id) => {
    const imp = impayes.find((v: any) => v.id === id);
    return s + (imp?.reste || 0);
  }, 0);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const demande = useMutation({
    mutationFn: () => axios.post(`${API}/versements`, { chauffeurId: c.id, montantVerse: parseFloat(montant) }, { headers: { Authorization: `Bearer ${token()}` } }),
    onSuccess: () => { setMsg('✅ Demande envoyée'); setMontant(''); qc.invalidateQueries({ queryKey: ['versements'] }); },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const reglerMultiple = () => {
    axios.post(`${API}/versements/multiple`, {
      chauffeurId: c?.id,
      versementIds: Array.from(selectedIds),
      montantTotal: totalSelected,
    }, { headers: { Authorization: `Bearer ${token()}` } })
      .then(() => {
        setMsg('✅ Versements réglés !');
        setSelectedIds(new Set());
        setShowPayment(false);
        qc.invalidateQueries({ queryKey: ['versements'] });
      })
      .catch((err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')));
  };

  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ color: '#DAA520', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>💰 Versements</h1>

      {msg && <div style={{ padding: 10, borderRadius: 8, marginBottom: 12, textAlign: 'center', fontSize: 12, background: msg.includes('✅') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)', color: msg.includes('✅') ? '#86efac' : '#fca5a5' }}>{msg}</div>}

      {/* Résumé */}
      <div className="card">
        <div className="card-title">💰 Résumé du jour</div>
        <div className="stats-grid">
          <div className="stat-item"><div className="stat-value" style={{ color: '#DAA520' }}>{resume.gainNetJour.toLocaleString()} Ar</div><div className="stat-label">Gain net du jour</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: '#27ae60' }}>{resume.totalVerse.toLocaleString()} Ar</div><div className="stat-label">Total versé</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: '#e74c3c' }}>{resume.resteAPayer.toLocaleString()} Ar</div><div className="stat-label">Reste à payer</div></div>
          <div className="stat-item"><div className="stat-value" style={{ color: resume.disponible >= 0 ? '#27ae60' : '#e74c3c' }}>{resume.disponible.toLocaleString()} Ar</div><div className="stat-label">Disponible</div></div>
        </div>
      </div>

      {/* Impayés avec sélection */}
      {impayes.length > 0 && (
        <div className="card" style={{ borderLeft: '3px solid #e74c3c' }}>
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚠️ Versements impayés ({impayes.length})</span>
            {selectedIds.size > 0 && (
              <button onClick={() => setShowPayment(true)} style={{ padding: '6px 12px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 'bold', cursor: 'pointer' }}>
                💰 Régler ({totalSelected.toLocaleString()} Ar)
              </button>
            )}
          </div>
          {impayes.map((v: any) => (
            <div key={v.id} onClick={() => toggleSelect(v.id)}
              style={{ background: selectedIds.has(v.id) ? 'rgba(39,174,96,0.15)' : '#252525', borderRadius: 10, padding: 10, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: selectedIds.has(v.id) ? '1px solid #27ae60' : '1px solid transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelect(v.id)} style={{ width: 18, height: 18, accentColor: '#27ae60', cursor: 'pointer' }} />
                <div>
                  <div style={{ fontWeight: 'bold', color: '#e74c3c' }}>{v.reste?.toLocaleString()} Ar</div>
                  <div style={{ fontSize: 10, color: '#888' }}>📅 {new Date(v.date).toLocaleDateString('fr')} - Dû: {v.montantDu?.toLocaleString()} Ar</div>
                </div>
              </div>
              <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>⚠️ Impayé</span>
            </div>
          ))}
          {selectedIds.size > 0 && (
            <div style={{ background: '#1a1a1a', borderRadius: 10, padding: 12, textAlign: 'center', marginTop: 8 }}>
              <div style={{ fontSize: 11, color: '#888' }}>Total sélectionné</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: '#27ae60' }}>{totalSelected.toLocaleString()} Ar</div>
            </div>
          )}
        </div>
      )}

      {/* Nouveau versement */}
      <div className="card">
        <div className="card-title">💵 Nouveau versement</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" value={montant} onChange={e => setMontant(e.target.value)}
            placeholder={"Suggéré: " + (resume.montantSuggere || 0).toLocaleString() + " Ar"}
            style={{ flex: 1, padding: 12, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
          <button onClick={() => montant && demande.mutate()} disabled={!montant}
            style={{ padding: '12px 20px', background: '#DAA520', color: '#000', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', opacity: !montant ? 0.5 : 1 }}>Envoyer</button>
        </div>
      </div>

      {/* Historique */}
      <div className="card">
        <div className="card-title">📋 Historique</div>
        {versements.map((v: any) => (
          <div key={v.id} style={{ background: '#252525', borderRadius: 10, padding: 10, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 14 }}>{v.montantVerse?.toLocaleString()} Ar</div>
              <div style={{ fontSize: 10, color: '#888' }}>{new Date(v.createdAt).toLocaleDateString('fr')} - Dû: {v.montantDu?.toLocaleString()} Ar</div>
            </div>
            <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
              background: v.statut === 'VALIDE' ? 'rgba(39,174,96,0.2)' : v.statut === 'REFUSE' ? 'rgba(239,68,68,0.2)' : 'rgba(243,156,18,0.2)',
              color: v.statut === 'VALIDE' ? '#27ae60' : v.statut === 'REFUSE' ? '#ef4444' : '#f39c12' }}>
              {v.statut === 'VALIDE' ? '✅ Validé' : v.statut === 'REFUSE' ? '❌ Refusé' : '⏳ En attente'}
            </span>
          </div>
        ))}
        {versements.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucun versement</p>}
      </div>

      {/* Modal règlement groupé */}
      {showPayment && (
        <div className="modal-overlay" onClick={() => setShowPayment(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#DAA520', marginBottom: 12 }}>💰 Régularisation</h3>
            <p style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>{selectedIds.size} versement(s) sélectionné(s)</p>
            <div style={{ background: '#252525', borderRadius: 10, padding: 15, textAlign: 'center', marginBottom: 16 }}>
              <div style={{ fontSize: 11, color: '#888' }}>Montant total à régler</div>
              <div style={{ fontSize: 28, fontWeight: 'bold', color: '#27ae60' }}>{totalSelected.toLocaleString()} Ar</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setShowPayment(false)} style={{ flex: 1, padding: 12, background: '#333', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Annuler</button>
              <button onClick={reglerMultiple} style={{ flex: 1, padding: 12, background: '#27ae60', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
