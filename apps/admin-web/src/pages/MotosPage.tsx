import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Bike, Search } from 'lucide-react';
import { useState } from 'react';

const API = 'http://localhost:3000/api/v1';

export function MotosPage() {
  const [search, setSearch] = useState('');
  const { data: motos } = useQuery({
    queryKey: ['motos'],
    queryFn: () => axios.get(`${API}/motos`).then(r => r.data).catch(() => []),
  });

  // Fallback si pas de route motos
  const motosData = Array.isArray(motos) ? motos : [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Motos</h1>
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" placeholder="Rechercher une moto..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-400">
        <Bike size={48} className="mx-auto mb-3 text-gray-300" />
        <p>Module en développement</p>
        <p className="text-sm">API /motos à créer</p>
      </div>
    </div>
  );
}
