import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';
const token = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

export function VersementsPage() {
  const c = chauffeur();
  const qc = useQueryClient();
  const [montant, setMontant] = useState('');
  const [msg, setMsg] = useState('');
  const { data: versements } = useQuery({
    queryKey: ['versements', c?.id],
    queryFn: () => axios.get(`${API}/versements/chauffeur/${c?.id}`, { headers: { Authorization: `Bearer ${token()}` } }).then(r => r.data),
    enabled: !!c?.id,
  });
  const demande = useMutation({
    mutationFn: () => axios.post(`${API}/versements`, { chauffeurId: c.id, montantVerse: parseFloat(montant) }, { headers: { Authorization: `Bearer ${token()}` } }),
    onSuccess: () => { setMsg('✅ Demande envoyée'); setMontant(''); qc.invalidateQueries({ queryKey: ['versements'] }); },
  });
  return (
    <div style={{ padding: 12 }}>
      <h1 style={{ color: '#DAA520', fontSize: 18, fontWeight: 700, marginBottom: 12 }}>💰 Versements</h1>
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Solde dû : <strong style={{ color: '#fff' }}>{c?.solde?.toLocaleString() || 0} Ar</strong></p>
      {msg && <div style={{ padding: 10, borderRadius: 8, marginBottom: 12, textAlign: 'center', fontSize: 12, background: 'rgba(34,197,94,0.2)', color: '#86efac' }}>{msg}</div>}
      <div style={{ background: '#1e293b', borderRadius: 12, padding: 14, marginBottom: 16, display: 'flex', gap: 8 }}>
        <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant" style={{ flex: 1, padding: 10, background: '#0f172a', border: '1px solid #334155', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
        <button onClick={() => montant && demande.mutate()} disabled={!montant} style={{ padding: '10px 16px', background: '#DAA520', color: '#000', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', opacity: !montant ? 0.5 : 1 }}>Envoyer</button>
      </div>
      {(Array.isArray(versements) ? versements : []).map((v: any) => (
        <div key={v.id} style={{ background: '#1e293b', borderRadius: 10, padding: 12, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
          <div><div style={{ fontWeight: 600 }}>{v.montantVerse?.toLocaleString()} Ar</div><div style={{ fontSize: 10, color: '#64748b' }}>{new Date(v.createdAt).toLocaleDateString('fr')}</div></div>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: v.statut === 'VALIDE' ? 'rgba(34,197,94,0.15)' : 'rgba(234,179,8,0.15)', color: v.statut === 'VALIDE' ? '#22c55e' : '#eab308' }}>{v.statut === 'VALIDE' ? 'Validé' : 'En attente'}</span>
        </div>
      ))}
    </div>
  );
}
