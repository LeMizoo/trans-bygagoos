import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bike, Search } from 'lucide-react';
import { useState } from 'react';

import { API_URL } from '../lib/api';
const API = API_URL;

export function MotosPage() {
  const [search, setSearch] = useState('');
  const { data: motos } = useQuery({
    queryKey: ['motos'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data).catch(() => []),
  });

  const filtered = (motos || []).filter((m: any) =>
    m.immatriculation?.toLowerCase().includes(search.toLowerCase()) ||
    m.marque?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Motos</h1>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher une moto..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
      </div>
      <div className="grid gap-4">
        {filtered.map((m: any) => (
          <div key={m.id} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4">
            <Bike size={24} className="text-primary" />
            <div>
              <p className="font-semibold">{m.marque} {m.modele}</p>
              <p className="text-sm text-gray-500">{m.immatriculation} · {m.kmActuel?.toLocaleString()} km</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
