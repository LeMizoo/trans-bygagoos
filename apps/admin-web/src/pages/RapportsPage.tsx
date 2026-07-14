import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { BarChart3, FileText, Download, Loader2 } from 'lucide-react';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

export function RapportsPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [msg, setMsg] = useState('');

  const exporterPDF = async (type: string) => {
    setLoading(type);
    setMsg('');
    try {
      let url = '';
      if (type === 'journalier') {
        const today = new Date().toISOString().split('T')[0];
        url = `${API}/courses?date=${today}`;
      } else if (type === 'mensuel') {
        url = `${API}/courses?limit=1000`;
      } else {
        url = `${API}/chauffeurs`;
      }
      
      const { data } = await axios.get(url);
      const contenu = JSON.stringify(data, null, 2);
      
      // Créer un blob et télécharger
      const blob = new Blob([contenu], { type: type === 'chauffeurs' ? 'text/csv' : 'application/json' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `rapport_${type}_${new Date().toISOString().split('T')[0]}.${type === 'chauffeurs' ? 'csv' : 'json'}`;
      a.click();
      URL.revokeObjectURL(href);
      
      setMsg(`✅ Rapport ${type} exporté !`);
    } catch (err) {
      setMsg('❌ Erreur lors de l\'export');
    } finally {
      setLoading(null);
    }
  };

  const exporterCSV = async () => {
    setLoading('chauffeurs');
    setMsg('');
    try {
      const { data: chauffeurs } = await axios.get(`${API}/chauffeurs`);
      const { data: courses } = await axios.get(`${API}/courses?limit=5000`);
      
      let csv = 'Chauffeur,CA,Commission,Gain Net,Courses\n';
      for (const c of chauffeurs) {
        const chauffeurCourses = courses.items?.filter((co: any) => co.chauffeurId === c.id) || [];
        const ca = chauffeurCourses.reduce((s: number, co: any) => s + co.prix, 0);
        const commission = chauffeurCourses.reduce((s: number, co: any) => s + co.commission, 0);
        const gainNet = chauffeurCourses.reduce((s: number, co: any) => s + co.gainNet, 0);
        csv += `${c.nom},${ca},${commission},${gainNet},${chauffeurCourses.length}\n`;
      }
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const href = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = href;
      a.download = `rapport_chauffeurs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(href);
      
      setMsg('✅ Rapport CSV exporté !');
    } catch (err) {
      setMsg('❌ Erreur lors de l\'export');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        <BarChart3 size={24} className="text-primary" /> Rapports
      </h1>

      {msg && (
        <div className={`p-3 rounded-lg text-sm ${msg.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Journalier */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
          <FileText size={48} className="mx-auto mb-3 text-primary" />
          <h3 className="font-semibold text-lg">Rapport journalier</h3>
          <p className="text-sm text-gray-500 mt-1">Courses, CA, commissions du jour</p>
          <button onClick={() => exporterPDF('journalier')} disabled={loading === 'journalier'}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 mx-auto hover:bg-primary/90 disabled:opacity-50">
            {loading === 'journalier' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {loading === 'journalier' ? 'Export...' : 'Exporter JSON'}
          </button>
        </div>

        {/* Mensuel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
          <BarChart3 size={48} className="mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold text-lg">Rapport mensuel</h3>
          <p className="text-sm text-gray-500 mt-1">Synthèse de toutes les courses</p>
          <button onClick={() => exporterPDF('mensuel')} disabled={loading === 'mensuel'}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded-lg text-sm flex items-center gap-2 mx-auto hover:bg-green-600 disabled:opacity-50">
            {loading === 'mensuel' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {loading === 'mensuel' ? 'Export...' : 'Exporter JSON'}
          </button>
        </div>

        {/* Chauffeurs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center hover:shadow-lg transition-shadow">
          <FileText size={48} className="mx-auto mb-3 text-purple-500" />
          <h3 className="font-semibold text-lg">Rapport chauffeurs</h3>
          <p className="text-sm text-gray-500 mt-1">Performance par chauffeur</p>
          <button onClick={exporterCSV} disabled={loading === 'chauffeurs'}
            className="mt-4 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm flex items-center gap-2 mx-auto hover:bg-purple-600 disabled:opacity-50">
            {loading === 'chauffeurs' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {loading === 'chauffeurs' ? 'Export...' : 'Exporter CSV'}
          </button>
        </div>
      </div>
    </div>
  );
}
