import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DollarSign, Clock, Check, X, ArrowLeft, Send } from 'lucide-react';

const API = 'http://localhost:3000/api/v1';
function getToken() { return localStorage.getItem('chauffeur-token'); }
function getChauffeur() { return JSON.parse(localStorage.getItem('chauffeur') || '{}'); }

export function VersementsPage() {
  const chauffeur = getChauffeur();
  const queryClient = useQueryClient();
  const [montant, setMontant] = useState('');
  const [msg, setMsg] = useState('');

  const { data: versements } = useQuery({
    queryKey: ['versements', chauffeur?.id],
    queryFn: () => axios.get(`${API}/versements/chauffeur/${chauffeur?.id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    }).then(r => r.data),
    enabled: !!chauffeur?.id,
    refetchInterval: 15000,
  });

  const demandeVersement = useMutation({
    mutationFn: async () => {
      const res = await axios.post(`${API}/versements`, {
        chauffeurId: chauffeur.id,
        montantVerse: parseFloat(montant),
      }, { headers: { Authorization: `Bearer ${getToken()}` } });
      return res.data;
    },
    onSuccess: () => {
      setMsg('Demande envoyée !');
      setMontant('');
      queryClient.invalidateQueries({ queryKey: ['versements'] });
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (err: any) => {
      setMsg('Erreur: ' + (err.response?.data?.message || err.message));
    },
  });

  const statutBadge = (statut: string) => {
    const config: any = {
      VALIDE: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e', icon: Check, label: 'Validé' },
      REFUSE: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', icon: X, label: 'Refusé' },
      EN_ATTENTE: { bg: 'rgba(234,179,8,0.15)', color: '#eab308', icon: Clock, label: 'En attente' },
    };
    const c = config[statut] || config.EN_ATTENTE;
    const Icon = c.icon;
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: c.bg, color: c.color }}>
        <Icon size={12} /> {c.label}
      </span>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#fff', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
      <a href="/dashboard" style={{ color: '#94a3b8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <ArrowLeft size={18} /> Retour
      </a>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Versements</h1>
      <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Solde dû : <strong style={{ color: '#fff' }}>{chauffeur?.solde?.toLocaleString() || 0} Ar</strong></p>

      {/* Formulaire demande */}
      <div style={{ background: '#1e293b', borderRadius: 16, padding: 16, marginBottom: 20 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Nouvelle demande</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            value={montant}
            onChange={e => setMontant(e.target.value)}
            placeholder="Montant à verser"
            style={{ flex: 1, padding: 12, background: '#0f172a', border: '1px solid #334155', borderRadius: 12, color: '#fff', fontSize: 16, outline: 'none' }}
          />
          <button
            onClick={() => montant && demandeVersement.mutate()}
            disabled={!montant || demandeVersement.isPending}
            style={{ padding: '12px 20px', background: '#e94560', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, opacity: !montant ? 0.5 : 1 }}
          >
            <Send size={16} /> Envoyer
          </button>
        </div>
      </div>

      {msg && (
        <div style={{ padding: 12, borderRadius: 10, marginBottom: 16, textAlign: 'center', background: msg.includes('Erreur') ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.2)', color: msg.includes('Erreur') ? '#fca5a5' : '#86efac' }}>
          {msg}
        </div>
      )}

      {/* Historique */}
      <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>Historique</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {versements?.map((v: any) => (
          <div key={v.id} style={{ background: '#1e293b', borderRadius: 14, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{v.montantVerse.toLocaleString()} Ar</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{new Date(v.createdAt).toLocaleDateString('fr', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            {statutBadge(v.statut)}
          </div>
        ))}
        {!versements?.length && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: 30 }}>Aucun versement</div>
        )}
      </div>
    </div>
  );
}
