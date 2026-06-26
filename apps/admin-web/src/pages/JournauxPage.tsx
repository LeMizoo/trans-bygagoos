import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Clock, FileText, HandCoins, AlertCircle, BarChart3, Calendar } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function JournauxPage() {
  const [tab, setTab] = useState('pointages');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);

  const { data: stats } = useQuery({
    queryKey: ['journaux-stats'],
    queryFn: () => axios.get(`${API}/journaux/stats`).then(r => r.data),
  });

  const { data: pointages } = useQuery({
    queryKey: ['journaux-pointages', date, page],
    queryFn: () => axios.get(`${API}/journaux/pointages?date=${date}&page=${page}`).then(r => r.data),
    enabled: tab === 'pointages',
  });

  const { data: courses } = useQuery({
    queryKey: ['journaux-courses', date, page],
    queryFn: () => axios.get(`${API}/journaux/courses?date=${date}&page=${page}`).then(r => r.data),
    enabled: tab === 'courses',
  });

  const { data: versements } = useQuery({
    queryKey: ['journaux-versements', page],
    queryFn: () => axios.get(`${API}/journaux/versements?page=${page}`).then(r => r.data),
    enabled: tab === 'versements',
  });

  const { data: assistance } = useQuery({
    queryKey: ['journaux-assistance', page],
    queryFn: () => axios.get(`${API}/journaux/assistance?page=${page}`).then(r => r.data),
    enabled: tab === 'assistance',
  });

  const tabs = [
    { key: 'pointages', label: '📍 Pointages', icon: Clock, color: 'text-blue-500' },
    { key: 'courses', label: '🚖 Courses', icon: FileText, color: 'text-green-500' },
    { key: 'versements', label: '💰 Versements', icon: HandCoins, color: 'text-yellow-500' },
    { key: 'assistance', label: '🆘 Assistance', icon: AlertCircle, color: 'text-red-500' },
  ];

  const currentData = tab === 'pointages' ? pointages : tab === 'courses' ? courses : tab === 'versements' ? versements : assistance;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Journaux d'activité</h1>

      {/* Stats globales */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalCourses}</div>
            <div className="text-xs text-gray-500">Courses totales</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{stats.caTotal?.toLocaleString()} Ar</div>
            <div className="text-xs text-gray-500">CA total</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-yellow-500">{stats.totalVersements}</div>
            <div className="text-xs text-gray-500">Versements</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl border p-4 text-center">
            <div className="text-2xl font-bold text-red-500">{stats.totalAssistance}</div>
            <div className="text-xs text-gray-500">Assistance</div>
          </div>
        </div>
      )}

      {/* Filtre date */}
      <div className="flex items-center gap-3">
        <Calendar size={18} className="text-gray-400" />
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }} className="px-3 py-1.5 border rounded-lg text-sm dark:bg-gray-700 dark:border-gray-600" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            className={`px-4 py-2 rounded-t-lg text-sm font-medium flex items-center gap-1 ${tab === t.key ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>
            <t.icon size={14} className={t.color} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 dark:bg-gray-700 text-left text-gray-500 dark:text-gray-400">
            {tab === 'pointages' && <><th className="p-3">Date/Heure</th><th className="p-3">Chauffeur</th><th className="p-3">Type</th></>}
            {tab === 'courses' && <><th className="p-3">Date</th><th className="p-3">Chauffeur</th><th className="p-3">Moto</th><th className="p-3">Type</th><th className="p-3 text-right">Prix</th></>}
            {tab === 'versements' && <><th className="p-3">Date</th><th className="p-3">Chauffeur</th><th className="p-3 text-right">Montant dû</th><th className="p-3 text-right">Versé</th><th className="p-3">Statut</th></>}
            {tab === 'assistance' && <><th className="p-3">Date</th><th className="p-3">Chauffeur</th><th className="p-3">Type</th><th className="p-3">Urgence</th><th className="p-3">Statut</th></>}
          </tr></thead>
          <tbody className="divide-y dark:divide-gray-700">
            {currentData?.items?.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {tab === 'pointages' && <>
                  <td className="p-3">{new Date(item.datePointage).toLocaleString('fr')}</td>
                  <td className="p-3 font-medium">{item.chauffeur?.nom}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'ARRIVEE' ? 'bg-green-100 text-green-700' : item.type === 'PAUSE' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{item.type}</span></td>
                </>}
                {tab === 'courses' && <>
                  <td className="p-3">{new Date(item.createdAt).toLocaleString('fr')}</td>
                  <td className="p-3 font-medium">{item.chauffeur?.nom}</td>
                  <td className="p-3">{item.moto?.immatriculation}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3 text-right font-medium">{item.prix?.toLocaleString()} Ar</td>
                </>}
                {tab === 'versements' && <>
                  <td className="p-3">{new Date(item.createdAt).toLocaleDateString('fr')}</td>
                  <td className="p-3 font-medium">{item.chauffeur?.nom}</td>
                  <td className="p-3 text-right">{item.montantDu?.toLocaleString()} Ar</td>
                  <td className="p-3 text-right">{item.montantVerse?.toLocaleString()} Ar</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${item.statut === 'VALIDE' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.statut}</span></td>
                </>}
                {tab === 'assistance' && <>
                  <td className="p-3">{new Date(item.createdAt).toLocaleDateString('fr')}</td>
                  <td className="p-3 font-medium">{item.chauffeur?.nom}</td>
                  <td className="p-3">{item.type}</td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${item.urgence === 'CRITIQUE' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.urgence}</span></td>
                  <td className="p-3"><span className={`px-2 py-0.5 rounded text-xs font-medium ${item.statut === 'OUVERT' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.statut}</span></td>
                </>}
              </tr>
            ))}
          </tbody>
        </table>
        {currentData?.pages > 1 && (
          <div className="flex justify-center gap-2 p-3">
            {Array.from({ length: currentData.pages }, (_, i) => (
              <button key={i} onClick={() => setPage(i + 1)} className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700'}`}>{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
