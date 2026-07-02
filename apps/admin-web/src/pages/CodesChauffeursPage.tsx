import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { QrCode, RefreshCw, Copy, Check, X, Edit, ToggleLeft, ToggleRight, Search } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function CodesChauffeursPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [newCode, setNewCode] = useState('');
  const [copied, setCopied] = useState('');
  const [msg, setMsg] = useState('');

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs-codes'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then(r => r.data),
    refetchInterval: 30000,
  });

  const updateCode = useMutation({
    mutationFn: ({ id, codeAcces }: { id: string; codeAcces: string }) =>
      axios.put(`${API}/chauffeurs/${id}/code`, { codeAcces }),
    onSuccess: () => {
      setMsg('✅ Code modifié');
      setEditId(null);
      queryClient.invalidateQueries({ queryKey: ['chauffeurs-codes'] });
    },
    onError: (err: any) => setMsg('❌ ' + (err.response?.data?.message || 'Erreur')),
  });

  const toggleActif = useMutation({
    mutationFn: (id: string) => axios.put(`${API}/chauffeurs/${id}/toggle-actif`),
    onSuccess: () => {
      setMsg('✅ Statut modifié');
      queryClient.invalidateQueries({ queryKey: ['chauffeurs-codes'] });
    },
  });

  const renouvelerTous = useMutation({
    mutationFn: () => axios.post(`${API}/chauffeurs/renouveler-tous`),
    onSuccess: (res: any) => {
      setMsg(`✅ ${res.data?.renouveles || 0} codes renouvelés`);
      queryClient.invalidateQueries({ queryKey: ['chauffeurs-codes'] });
    },
  });

  const renouvelerUn = useMutation({
    mutationFn: (id: string) => axios.post(`${API}/chauffeurs/${id}/renouveler`),
    onSuccess: (res: any) => {
      setMsg('✅ Nouveau code généré : ' + (res.data?.codeAcces || ''));
      queryClient.invalidateQueries({ queryKey: ['chauffeurs-codes'] });
    },
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(''), 2000);
  };

  const filtered = chauffeurs?.filter((c: any) =>
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.codeAcces?.includes(search) ||
    c.telephone?.includes(search)
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <QrCode size={24} className="text-primary" /> Codes d'accès
        </h1>
        <button onClick={() => renouvelerTous.mutate()}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 flex items-center gap-2 text-sm">
          <RefreshCw size={16} /> Renouveler tous les codes
        </button>
      </div>

      {msg && <div className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 p-3 rounded-lg text-sm">{msg}</div>}

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-3 mb-4">
          <Search size={18} className="text-gray-400" />
          <input type="text" placeholder="Rechercher par nom, code ou téléphone..." value={search} onChange={e => setSearch(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
                <th className="p-3">Chauffeur</th>
                <th className="p-3">Téléphone</th>
                <th className="p-3">Code d'accès</th>
                <th className="p-3">Statut</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered?.map((c: any) => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-3 font-medium text-gray-900 dark:text-white">{c.nom}</td>
                  <td className="p-3 text-gray-500">{c.telephone || '-'}</td>
                  <td className="p-3">
                    {editId === c.id ? (
                      <div className="flex items-center gap-2">
                        <input type="text" value={newCode} onChange={e => setNewCode(e.target.value)} maxLength={4}
                          className="w-20 px-2 py-1 border rounded text-center text-lg font-bold tracking-widest dark:bg-gray-700" />
                        <button onClick={() => updateCode.mutate({ id: c.id, codeAcces: newCode })} className="text-green-500"><Check size={16} /></button>
                        <button onClick={() => setEditId(null)} className="text-red-500"><X size={16} /></button>
                      </div>
                    ) : (
                      <span
                        onClick={() => copyCode(c.codeAcces)}
                        className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-lg font-mono text-lg font-bold tracking-widest text-primary cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                        title="Cliquer pour copier">
                        {c.codeAcces}
                        {copied === c.codeAcces ? <Check size={14} className="text-green-500" /> : <Copy size={14} className="text-gray-400" />}
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    <button onClick={() => toggleActif.mutate(c.id)} className="flex items-center gap-1">
                      {c.actif !== false ? (
                        <span className="flex items-center gap-1 text-green-600"><ToggleRight size={18} /> Actif</span>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500"><ToggleLeft size={18} /> Inactif</span>
                      )}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button onClick={() => { setEditId(c.id); setNewCode(c.codeAcces); }}
                        className="p-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-600 rounded-lg hover:bg-blue-200" title="Modifier">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => renouvelerUn.mutate(c.id)}
                        className="p-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-600 rounded-lg hover:bg-orange-200" title="Nouveau code">
                        <RefreshCw size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
