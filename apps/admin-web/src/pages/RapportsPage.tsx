import { useState } from 'react';
import { BarChart3, FileText, Download, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export function RapportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const exporterJSON = async (type: string) => {
    setLoading(type);
    setMsg('');
    try {
      let url = '';
      if (type === 'journalier') url = '/courses/today';
      else if (type === 'mensuel') url = '/rapports/monthly';
      else url = '/rapports';
      
      const { data } = await api.get(url);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `rapport_${type}_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      setMsg(`✅ Rapport ${type} exporté avec succès !`);
    } catch (err: any) {
      setMsg(`❌ Erreur: ${err.message}`);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">📈 Rapports</h2>
        <p className="text-gray-500 mt-1">Exportez vos données</p>
      </div>

      {msg && (
        <div className={`mb-6 p-4 rounded-lg ${msg.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { type: 'journalier', label: 'Rapport journalier', icon: FileText, desc: 'Courses du jour' },
          { type: 'mensuel', label: 'Rapport mensuel', icon: BarChart3, desc: 'Statistiques du mois' },
          { type: 'complet', label: 'Rapport complet', icon: Download, desc: 'Toutes les données' },
        ].map(r => (
          <button key={r.type} onClick={() => exporterJSON(r.type)} disabled={loading === r.type}
            className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border hover:shadow-md transition-all text-left disabled:opacity-50">
            <r.icon size={32} className="text-indigo-500 mb-4" />
            <h3 className="font-bold text-lg mb-1">{r.label}</h3>
            <p className="text-sm text-gray-500">{r.desc}</p>
            {loading === r.type && <Loader2 size={20} className="animate-spin mt-3 text-indigo-500" />}
          </button>
        ))}
      </div>
    </div>
  );
}
