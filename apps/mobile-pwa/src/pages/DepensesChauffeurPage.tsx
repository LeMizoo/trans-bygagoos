import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';
const tk = () => localStorage.getItem('chauffeur-token') || '';
const chauffeur = () => JSON.parse(localStorage.getItem('chauffeur') || '{}');
const moto = () => JSON.parse(localStorage.getItem('moto') || 'null') || chauffeur()?.moto;

const categories = [
  { value: 'CARBURANT', label: '⛽ Carburant', icon: '⛽' },
  { value: 'PNEU', label: '🛞 Pneu', icon: '🛞' },
  { value: 'REPARATION', label: '🔨 Réparation', icon: '🔨' },
];

export default function DepensesChauffeurPage() {
  const c = chauffeur();
  const m = moto();
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({
    description: '', montant: '', categorie: 'CARBURANT', litres: '', station: '',
  });

  const { data: depenses = [] } = useQuery({
    queryKey: ['depenses-chauffeur', m?.id],
    queryFn: () => axios.get(`${API}/depenses?motoId=${m?.id}`, { headers: { Authorization: `Bearer ${tk()}` } }).then(r => r.data?.items || []),
    enabled: !!m?.id,
  });

  const saveMutation = useMutation({
    mutationFn: (data: any) => axios.post(`${API}/depenses`, {
      ...data,
      motoId: m?.id,
      chauffeurId: c?.id,
    }, { headers: { Authorization: `Bearer ${tk()}` } }),
    onSuccess: () => {
      setMsg('✅ Dépense déclarée');
      setForm({ description: '', montant: '', categorie: 'CARBURANT', litres: '', station: '' });
      qc.invalidateQueries({ queryKey: ['depenses-chauffeur'] });
      setTimeout(() => setMsg(''), 2000);
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.montant) {
      setMsg('⚠️ Description et montant requis');
      return;
    }
    saveMutation.mutate({
      description: form.description,
      montant: parseFloat(form.montant),
      categorie: form.categorie,
      ...(form.litres ? { litres: parseFloat(form.litres) } : {}),
      ...(form.station ? { station: form.station } : {}),
    });
  };

  return (
    <div style={{ paddingBottom: 20 }}>
      {msg && (
        <div className={`floating-alert ${msg.includes('✅') ? 'success' : 'warning'}`}>{msg}</div>
      )}

      <div className="card">
        <div className="card-title">🔧 Déclarer une dépense</div>
        <p style={{ fontSize: 11, color: '#888', marginBottom: 12 }}>
          🏍️ {m?.immatriculation || 'Aucune moto'}
        </p>

        {!m && (
          <div style={{ background: 'rgba(239,68,68,0.1)', padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 12, color: '#ef4444' }}>
            ⚠️ Vous devez avoir une moto assignée pour déclarer une dépense.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <select value={form.categorie} onChange={e => setForm({ ...form, categorie: e.target.value })}
              style={{ width: '100%', padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13 }}>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Description (ex: Plein essence, Pneu crevé...)" disabled={!m}
              style={{ width: '100%', padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }} />
          </div>

          <div className="form-group">
            <input type="number" value={form.montant} onChange={e => setForm({ ...form, montant: e.target.value })}
              placeholder="Montant (Ar)" disabled={!m}
              style={{ width: '100%', padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }} />
          </div>

          {form.categorie === 'CARBURANT' && (
            <>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input type="number" step="0.1" value={form.litres} onChange={e => setForm({ ...form, litres: e.target.value })}
                  placeholder="Litres" disabled={!m}
                  style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }} />
                <input type="text" value={form.station} onChange={e => setForm({ ...form, station: e.target.value })}
                  placeholder="Station" disabled={!m}
                  style={{ flex: 1, padding: 10, background: '#252525', border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 13, outline: 'none' }} />
              </div>
            </>
          )}

          <button type="submit" disabled={!m || saveMutation.isPending}
            className="btn-primary" style={{ opacity: m ? 1 : 0.5 }}>
            {saveMutation.isPending ? '⏳...' : '📤 Déclarer'}
          </button>
        </form>
      </div>

      {/* Historique */}
      <div className="card">
        <div className="card-title">📋 Mes dépenses déclarées</div>
        {Array.isArray(depenses) && depenses.map((d: any) => (
          <div key={d.id} style={{ background: '#252525', borderRadius: 10, padding: 10, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: 13 }}>{d.description}</div>
              <div style={{ fontSize: 10, color: '#888' }}>
                {categories.find(cat => cat.value === d.categorie)?.label || d.categorie}
                {d.litres > 0 && ` · ${d.litres}L`}
                {d.station && ` · ${d.station}`}
                {' · '}{new Date(d.date).toLocaleDateString('fr')}
              </div>
            </div>
            <span style={{ color: '#ef4444', fontWeight: 600 }}>-{d.montant?.toLocaleString()} Ar</span>
          </div>
        ))}
        {(!depenses || depenses.length === 0) && (
          <p style={{ color: '#888', textAlign: 'center', padding: 20 }}>Aucune dépense</p>
        )}
      </div>
    </div>
  );
}
