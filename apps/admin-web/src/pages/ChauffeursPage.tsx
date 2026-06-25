import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from 'react';
import { Search, Phone, Bike, Circle, Pause, StopCircle } from 'lucide-react';
const API = "https://trans-bygagoos.onrender.com/api/v1";

const statutIcon: Record<string, any> = {
  EN_SERVICE: { icon: Circle, color: 'text-green-500', label: 'En service' },
  EN_PAUSE: { icon: Pause, color: 'text-yellow-500', label: 'En pause' },
  HORS_SERVICE: { icon: StopCircle, color: 'text-red-500', label: 'Hors service' },
};

export function ChauffeursPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const { data: chauffeurs } = useQuery({
    queryKey: ['chauffeurs'],
    queryFn: () => axios.get(`${API}/chauffeurs`).then((r) => r.data),
  });

  const { data: detail } = useQuery({
    queryKey: ['chauffeur', selected?.id],
    queryFn: () => axios.get(`${API}/chauffeurs/${selected.id}`).then((r) => r.data),
    enabled: !!selected,
  });

  const filtered = chauffeurs?.filter((c: any) =>
    c.nom.toLowerCase().includes(search.toLowerCase()) ||
    c.codeAcces.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chauffeurs</h1>
        <span className="text-sm text-gray-500">{chauffeurs?.length || 0} chauffeurs</span>
      </div>

      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un chauffeur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {filtered?.map((c: any) => {
            const StatutIcon = statutIcon[c.statut]?.icon || Circle;
            return (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
                className={`w-full text-left p-4 rounded-xl border transition-colors ${
                  selected?.id === c.id ? 'border-primary bg-primary/5' : 'border-gray-100 bg-white hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{c.nom}</p>
                  <StatutIcon size={16} className={statutIcon[c.statut]?.color} />
                </div>
                <p className="text-sm text-gray-500">{c.codeAcces}</p>
                <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                  <Phone size={12} /> {c.telephone}
                </p>
              </button>
            );
          })}
        </div>

        {/* Détail */}
        <div className="lg:col-span-2">
          {detail ? (
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{detail.nom}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  detail.statut === 'EN_SERVICE' ? 'bg-green-100 text-green-700' :
                  detail.statut === 'EN_PAUSE' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {statutIcon[detail.statut]?.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Code :</span> <strong>{detail.codeAcces}</strong></div>
                <div><span className="text-gray-500">Tél :</span> <strong>{detail.telephone}</strong></div>
                <div><span className="text-gray-500">Solde :</span> <strong className="text-primary">{detail.solde.toLocaleString()} Ar</strong></div>
                <div><span className="text-gray-500">Moto :</span> <strong>{detail.moto?.immatriculation || 'Aucune'}</strong></div>
              </div>

              {detail.moto && (
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Bike size={18} className="text-gray-400" />
                  <span>{detail.moto.marque} {detail.moto.modele} - {detail.moto.kmActuel.toLocaleString()} km</span>
                </div>
              )}

              {/* Dernières courses */}
              <div>
                <h3 className="font-semibold mb-2">Dernières courses</h3>
                <div className="space-y-1">
                  {detail.courses?.slice(0, 5).map((course: any) => (
                    <div key={course.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="text-gray-600">{new Date(course.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="capitalize">{course.type.replace('_', ' ').toLowerCase()}</span>
                      <span className="font-medium">{course.prix.toLocaleString()} Ar</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center text-gray-400">
              Sélectionnez un chauffeur
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
