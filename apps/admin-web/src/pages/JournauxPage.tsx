import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Clock, MapPin, DollarSign, AlertCircle, Wrench, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const tabs = [
  { key: 'pointages', label: 'Pointages', icon: Clock, color: 'text-blue-500' },
  { key: 'courses', label: 'Courses', icon: MapPin, color: 'text-green-500' },
  { key: 'versements', label: 'Versements', icon: DollarSign, color: 'text-yellow-500' },
  { key: 'depenses', label: 'Dépenses', icon: Wrench, color: 'text-red-500' },
  { key: 'assistance', label: 'Assistance', icon: AlertCircle, color: 'text-purple-500' },
];

export function JournauxPage() {
  const [tab, setTab] = useState('pointages');
  const [page, setPage] = useState(1);
  const [date, setDate] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['journaux', tab, page, date],
    queryFn: () => axios.get(`${API}/journaux/${tab}?page=${page}&limit=25${date ? `&date=${date}` : ''}`).then(r => r.data),
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
        📋 Journaux d'activité
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
            }`}>
            <t.icon size={16} className={tab === t.key ? 'text-white' : t.color} /> {t.label}
          </button>
        ))}
      </div>

      {/* Filtre date */}
      <div className="flex gap-3 items-center">
        <input type="date" value={date} onChange={e => { setDate(e.target.value); setPage(1); }}
          className="px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm" />
        {date && <button onClick={() => setDate('')} className="text-xs text-red-500">✕ Effacer</button>}
        <span className="text-sm text-gray-500">{data?.total || 0} entrées</span>
      </div>

      {/* Liste */}
      <div className="space-y-2">
        {isLoading ? <div className="text-center py-12 text-gray-400">Chargement...</div> :
         !data?.items?.length ? <div className="text-center py-12 text-gray-400">Aucune entrée</div> :
         data.items.map((item: any) => (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                tab === 'pointages' ? 'bg-blue-100 dark:bg-blue-500/10' :
                tab === 'courses' ? 'bg-green-100 dark:bg-green-500/10' :
                tab === 'versements' ? 'bg-yellow-100 dark:bg-yellow-500/10' :
                tab === 'depenses' ? 'bg-red-100 dark:bg-red-500/10' :
                'bg-purple-100 dark:bg-purple-500/10'
              }`}>
                {tabs.find(t => t.key === tab)?.icon && {(()=>{const Icon=tabs.find(t=>t.key===tab)?.icon;return Icon?<Icon size={18}/>:null;})()}}
              </div>
              <div>
                {tab === 'pointages' && <PointageRow item={item} />}
                {tab === 'courses' && <CourseRow item={item} />}
                {tab === 'versements' && <VersementRow item={item} />}
                {tab === 'depenses' && <DepenseRow item={item} />}
                {tab === 'assistance' && <AssistanceRow item={item} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {data?.pages > 1 && (
        <div className="flex justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-30"><ChevronLeft size={16} /></button>
          <span className="px-4 py-2 text-sm text-gray-500">Page {page} / {data.pages}</span>
          <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 disabled:opacity-30"><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

function PointageRow({ item }: any) {
  const typeLabels: Record<string, string> = { ARRIVEE: '🟢 Arrivée', PAUSE: '🟠 Pause', REPRISE: '🔵 Reprise', FIN_SERVICE: '🔴 Fin' };
  return (
    <>
      <p className="font-medium text-sm">{item.chauffeur?.nom || 'Inconnu'}</p>
      <p className="text-xs text-gray-500">
        {typeLabels[item.type] || item.type} · {new Date(item.datePointage).toLocaleString('fr')}
      </p>
    </>
  );
}

function CourseRow({ item }: any) {
  return (
    <>
      <p className="font-medium text-sm">{item.chauffeur?.nom || 'Inconnu'} · 🏍️ {item.moto?.immatriculation || '?'}</p>
      <p className="text-xs text-gray-500">
        {item.type} · {item.prix?.toLocaleString()} Ar · {new Date(item.createdAt).toLocaleString('fr')}
      </p>
    </>
  );
}

function VersementRow({ item }: any) {
  const statutColors: Record<string, string> = { VALIDE: 'text-green-600', EN_ATTENTE: 'text-yellow-600', REFUSE: 'text-red-600' };
  return (
    <>
      <p className="font-medium text-sm">{item.chauffeur?.nom || 'Inconnu'}</p>
      <p className="text-xs text-gray-500">
        Dû: {item.montantDu?.toLocaleString()} Ar · Versé: {item.montantVerse?.toLocaleString()} Ar ·
        <span className={statutColors[item.statut] || ''}> {item.statut}</span> · {new Date(item.createdAt).toLocaleDateString('fr')}
      </p>
    </>
  );
}

function DepenseRow({ item }: any) {
  return (
    <>
      <p className="font-medium text-sm">{item.description} · 🏍️ {item.moto?.immatriculation || '?'}</p>
      <p className="text-xs text-gray-500">
        {item.categorie} · -{item.montant?.toLocaleString()} Ar · {new Date(item.date).toLocaleDateString('fr')}
      </p>
    </>
  );
}

function AssistanceRow({ item }: any) {
  return (
    <>
      <p className="font-medium text-sm">{item.chauffeur?.nom || 'Inconnu'} · {item.type}</p>
      <p className="text-xs text-gray-500">
        {item.description} · {item.urgence} · {new Date(item.createdAt).toLocaleString('fr')}
      </p>
    </>
  );
}
