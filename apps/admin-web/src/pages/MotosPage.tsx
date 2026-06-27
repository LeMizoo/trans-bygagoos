import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Bike, Search, User, AlertTriangle, Check, X, Filter } from 'lucide-react';
import { useState } from 'react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function MotosPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('tous');
  const [showAssign, setShowAssign] = useState<string | null>(null);
  const [selectedChauffeur, setSelectedChauffeur] = useState('');
  const [msg, setMsg] = useState('');

  const { data: motos } = useQuery({
    queryKey: ['motos'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data),
    refetchInterval: 15000,
  });

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs-sans-moto'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data?.filter((c: any) => !c.motoId)),
  });

  const assignMutation = useMutation({
    mutationFn: ({ motoId, chauffeurId }: { motoId: string; chauffeurId: string }) =>
      axios.post(`${API}/motos/${motoId}/assigner`, { chauffeurId }),
    onSuccess: () => {
      setMsg('✅ Moto assignée');
      setShowAssign(null);
      setSelectedChauffeur('');
      queryClient.invalidateQueries({ queryKey: ['motos'] });
      queryClient.invalidateQueries({ queryKey: ['chauffeurs-sans-moto'] });
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const desassignMutation = useMutation({
    mutationFn: (motoId: string) => axios.post(`${API}/motos/${motoId}/desassigner`),
    onSuccess: () => {
      setMsg('✅ Moto désassignée');
      queryClient.invalidateQueries({ queryKey: ['motos'] });
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const motosList = Array.isArray(motos) ? motos : [];
  
  const filtered = motosList.filter((m: any) => {
    const matchSearch = !search || 
      m.immatriculation?.toLowerCase().includes(search.toLowerCase()) ||
      m.marque?.toLowerCase().includes(search.toLowerCase()) ||
      m.chauffeur?.nom?.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'disponible') return matchSearch && !m.chauffeur;
    if (filter === 'utilisee') return matchSearch && m.chauffeur;
    return matchSearch;
  });

  const stats = {
    total: motosList.length,
    disponibles: motosList.filter((m: any) => !m.chauffeur).length,
    utilisees: motosList.filter((m: any) => m.chauffeur).length,
    kmTotal: motosList.reduce((s: number, m: any) => s + (m.kmActuel || 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Bike size={28} className="text-primary" /> Parc Moto
        </h1>
        <span className="text-sm text-gray-500">{stats.total} motos</span>
      </div>

      {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{msg}</div>}

      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-gray-500">Total motos</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 p-4 text-center">
          <div className="text-2xl font-bold text-green-500">{stats.disponibles}</div>
          <div className="text-xs text-gray-500">Disponibles</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 p-4 text-center">
          <div className="text-2xl font-bold text-orange-500">{stats.kmTotal.toLocaleString()} km</div>
          <div className="text-xs text-gray-500">Kilométrage total</div>
        </div>
      </div>

      {/* Filtres + Recherche */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>
        <div className="flex gap-1">
          {['tous', 'disponible', 'utilisee'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize ${filter === f ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Liste */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((m: any) => (
          <div key={m.id} className={`bg-white dark:bg-gray-800 rounded-xl border p-4 hover:shadow-md transition-shadow ${!m.chauffeur ? 'border-green-200 dark:border-green-500/20' : 'border-gray-200 dark:border-gray-700'}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{m.immatriculation}</h3>
                <p className="text-xs text-gray-500">{m.marque} {m.modele} · {m.kmActuel?.toLocaleString()} km</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${m.chauffeur ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                {m.chauffeur ? '🏍️ Assignée' : '✅ Disponible'}
              </span>
            </div>

            {m.chauffeur ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <User size={14} />
                  <span>{m.chauffeur?.nom}</span>
                </div>
                <button onClick={() => desassignMutation.mutate(m.id)}
                  className="px-2 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-xs hover:bg-red-100">
                  Désassigner
                </button>
              </div>
            ) : (
              <div>
                {showAssign === m.id ? (
                  <div className="flex gap-2">
                    <select value={selectedChauffeur} onChange={e => setSelectedChauffeur(e.target.value)}
                      className="flex-1 px-2 py-1 border rounded text-xs dark:bg-gray-700">
                      <option value="">Choisir...</option>
                      {chauffeurs?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.nom} ({c.codeAcces})</option>
                      ))}
                    </select>
                    <button onClick={() => selectedChauffeur && assignMutation.mutate({ motoId: m.id, chauffeurId: selectedChauffeur })}
                      className="px-2 py-1 bg-green-50 text-green-600 rounded text-xs">✓</button>
                    <button onClick={() => setShowAssign(null)} className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">✕</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAssign(m.id)}
                    className="w-full px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-xs font-medium hover:bg-primary/20">
                    + Assigner un chauffeur
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
