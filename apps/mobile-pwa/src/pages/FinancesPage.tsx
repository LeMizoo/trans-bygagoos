import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import DepensesChauffeurPage from './DepensesChauffeurPage';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');

function VersementsContent() {
  const c = chauffeur();
  const [montant, setMontant] = useState('');
  const [msg, setMsg] = useState('');
  const qc = useQueryClient();
  
  const { data } = useQuery({
    queryKey: ['versements', c?.id],
    queryFn: () => axios.get(`${API}/versements/chauffeur/${c?.id}`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data),
    enabled: !!c?.id
  });
  
  const versements = Array.isArray(data?.versements) ? data.versements : Array.isArray(data) ? data : [];
  
  const envoyer = () => {
    if (!montant) return;
    axios.post(`${API}/versements`, { chauffeurId: c?.id, montantVerse: parseFloat(montant) }, { headers: { Authorization: `Bearer ${tk()}` } })
      .then((res) => { 
        setMsg('✅ Demande envoyée'); 
        setMontant(''); 
        qc.invalidateQueries({ queryKey: ['versements'] });
        qc.invalidateQueries({ queryKey: ['dashboard', c?.id] });
        if (res.data?.chauffeur?.solde !== undefined) {
          const chauffeurData = JSON.parse(localStorage.getItem('chauffeur') || '{}');
          chauffeurData.solde = res.data.chauffeur.solde;
          localStorage.setItem('chauffeur', JSON.stringify(chauffeurData));
          window.dispatchEvent(new Event('storage'));
        }
      })
      .catch((err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')));
  };
  
  return (
    <div>
      {msg && <div className={`floating-alert ${msg.includes('✅') ? 'success' : 'warning'}`}>{msg}</div>}
      <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 12 }}>Solde : <strong style={{ color: '#fff' }}>{c?.solde?.toLocaleString() || 0} Ar</strong></p>
      <div className="card">
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" value={montant} onChange={e => setMontant(e.target.value)} placeholder="Montant à verser" style={{ flex: '1 1 100%', padding: 10, minWidth: 0, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none' }} />
          <button onClick={envoyer} disabled={!montant} style={{ padding: '12px 20px', background: '#DAA520', color: '#000', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer', opacity: !montant ? 0.5 : 1 }}>Envoyer</button>
        </div>
      </div>
      <div className="card">
        <div className="card-title">📋 Historique</div>
        {versements.map((v: any) => (
          <div key={v.id} style={{ background: '#252525', borderRadius: 10, padding: 10, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontWeight: 'bold' }}>{v.montantVerse?.toLocaleString() || 0} Ar</div>
              <div style={{ fontSize: 10, color: '#888' }}>{new Date(v.createdAt).toLocaleDateString('fr')}</div>
            </div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 20, background: v.statut === 'VALIDE' ? 'rgba(39,174,96,0.2)' : 'rgba(243,156,18,0.2)', color: v.statut === 'VALIDE' ? '#27ae60' : '#f39c12' }}>{v.statut === 'VALIDE' ? '✅ Validé' : '⏳ En attente'}</span>
          </div>
        ))}
        {versements.length === 0 && <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucun versement</p>}
      </div>
    </div>
  );
}

export default function FinancesPage() {
  const [tab, setTab] = useState<'depenses' | 'versements'>('depenses');
  
  return (
    <div>
      <div className="page-title">💰 Finances</div>
      <div className="finances-tabs">
        <button className={`finances-tab ${tab === 'depenses' ? 'active' : ''}`} onClick={() => setTab('depenses')}>💸 Dépenses</button>
        <button className={`finances-tab ${tab === 'versements' ? 'active' : ''}`} onClick={() => setTab('versements')}>💰 Versements</button>
      </div>
      {tab === 'depenses' ? <DepensesChauffeurPage /> : <VersementsContent />}
    </div>
  );
}
