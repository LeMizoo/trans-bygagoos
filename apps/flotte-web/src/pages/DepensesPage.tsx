import React, { useState, useEffect } from 'react';
import { Receipt, Plus, X, Save, Trash2, Search } from 'lucide-react';
import { api } from '../api/client';

const categories = [
  { nom: '⛽ Carburant', couleur: '#e74c3c' },
  { nom: '🔧 Entretien', couleur: '#3498db' },
  { nom: '🔩 Pièces', couleur: '#f39c12' },
  { nom: '🛡️ Assurance', couleur: '#9b59b6' },
  { nom: '🛞 Pneu', couleur: '#1abc9c' },
  { nom: '🔨 Réparation', couleur: '#e67e22' },
  { nom: '📦 Divers', couleur: '#7f8c8d' },
];

export function DepensesPage() {
  const [depenses, setDepenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [msg, setMsg] = useState('');
  const [form, setForm] = useState({ type: 'CARBURANT', montant: '', description: '', date: new Date().toISOString().split('T')[0] });

  useEffect(function() {
    loadDepenses();
  }, []);

  function loadDepenses() {
    api.get('/depenses').then(function(res) {
      setDepenses(Array.isArray(res.data) ? res.data : []);
    }).finally(function() { setLoading(false); });
  }

  function addDepense(e: any) {
    e.preventDefault();
    api.post('/depenses', form).then(function() {
      setMsg('✅ Dépense ajoutée');
      setShowForm(false);
      setForm({ type: 'CARBURANT', montant: '', description: '', date: new Date().toISOString().split('T')[0] });
      loadDepenses();
      setTimeout(function() { setMsg(''); }, 3000);
    }).catch(function() {
      setMsg('❌ Erreur');
    });
  }

  function deleteDepense(id: string) {
    if (confirm('Supprimer cette dépense ?')) {
      api.delete('/depenses/' + id).then(function() {
        setMsg('✅ Dépense supprimée');
        loadDepenses();
      });
    }
  }

  var filtered = depenses.filter(function(d: any) {
    return (d.description + d.type).toLowerCase().includes(search.toLowerCase());
  });

  var totalMois = depenses.filter(function(d: any) {
    return new Date(d.date).getMonth() === new Date().getMonth();
  }).reduce(function(s: number, d: any) { return s + (d.montant || 0); }, 0);

  var totalGeneral = depenses.reduce(function(s: number, d: any) { return s + (d.montant || 0); }, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">💰 Dépenses globales</h2>
          <p className="text-gray-500">
            <span className="text-green-600 font-bold">Ce mois : {totalMois.toLocaleString()} Ar</span> · 
            <span className="text-amber-600 font-bold ml-2">Total : {totalGeneral.toLocaleString()} Ar</span>
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={function(e) { setSearch(e.target.value); }} placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 w-48" />
          </div>
          <button onClick={function() { setShowForm(!showForm); }}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Plus size={18} /> Ajouter
          </button>
        </div>
      </div>

      {msg && <div className={'mb-4 p-3 rounded-xl ' + (msg.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{msg}</div>}

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg"><Plus size={18} className="inline mr-2" />Ajouter une dépense</h3>
            <button onClick={function() { setShowForm(false); }}><X size={20} /></button>
          </div>
          <form onSubmit={addDepense} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold">Catégorie</label>
              <select value={form.type} onChange={function(e) { setForm({...form, type: e.target.value}); }}
                className="w-full p-3 border rounded-xl dark:bg-gray-700">
                {categories.map(function(c: any) {
                  return <option key={c.nom} value={c.nom.split(' ')[1] || c.nom}>{c.nom}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold">Montant (Ar)</label>
              <input type="number" value={form.montant} onChange={function(e) { setForm({...form, montant: e.target.value}); }}
                placeholder="ex: 25000" required className="w-full p-3 border rounded-xl dark:bg-gray-700" />
            </div>
            <div>
              <label className="text-sm font-semibold">Date</label>
              <input type="date" value={form.date} onChange={function(e) { setForm({...form, date: e.target.value}); }}
                className="w-full p-3 border rounded-xl dark:bg-gray-700" />
            </div>
            <div>
              <label className="text-sm font-semibold">Description</label>
              <input type="text" value={form.description} onChange={function(e) { setForm({...form, description: e.target.value}); }}
                placeholder="Détail..." className="w-full p-3 border rounded-xl dark:bg-gray-700" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700">
                <Save size={18} /> Enregistrer
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50 dark:bg-orange-900/20 text-orange-700">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Catégorie</th>
                <th className="text-left py-3 px-4">Description</th>
                <th className="text-right py-3 px-4">Montant</th>
                <th className="text-center py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-gray-400">Aucune dépense</td></tr>
              ) : (
                filtered.map(function(d: any) {
                  return (
                    <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">{new Date(d.date).toLocaleDateString('fr')}</td>
                      <td className="py-3 px-4">{d.type || 'AUTRE'}</td>
                      <td className="py-3 px-4">{d.description || '-'}</td>
                      <td className="py-3 px-4 text-right font-bold text-red-600">-{(d.montant || 0).toLocaleString()} Ar</td>
                      <td className="py-3 px-4 text-center">
                        <button onClick={function() { deleteDepense(d.id); }} className="p-1.5 hover:bg-red-100 rounded-lg text-red-500">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50 dark:bg-gray-700/50 font-bold">
                <td className="py-3 px-4" colSpan={3}>Total affiché :</td>
                <td className="py-3 px-4 text-right text-red-600">{filtered.reduce(function(s: number, d: any) { return s + (d.montant || 0); }, 0).toLocaleString()} Ar</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
