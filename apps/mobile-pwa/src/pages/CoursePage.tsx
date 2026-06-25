import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { MapPin, DollarSign, Bike, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { API_URL } from '../lib/api';
const API = API_URL;

function getChauffeur() {
  const data = localStorage.getItem('chauffeur');
  return data ? JSON.parse(data) : null;
}

function getToken() {
  return localStorage.getItem('chauffeur-token');
}

export function CoursePage() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [type, setType] = useState('NORMALE');
  const [distance, setDistance] = useState('');
  const [prix, setPrix] = useState('');
  const [msg, setMsg] = useState('');

  const createCourse = useMutation({
    mutationFn: async (data: any) => {
      const token = getToken();
      const res = await axios.post(`${API}/courses`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data;
    },
    onSuccess: (response) => {
      setMsg(`Course créée : ${response.prix.toLocaleString()} Ar`);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setDistance('');
      setPrix('');
      setTimeout(() => setMsg(''), 3000);
    },
    onError: (err: any) => {
      setMsg('Erreur: ' + (err.response?.data?.message || err.message));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const chauffeur = getChauffeur();
    createCourse.mutate({
      chauffeurId: chauffeur.id,
      motoId: chauffeur.moto?.id,
      type,
      distance: type === 'NORMALE' ? parseFloat(distance) : 0,
      prix: type !== 'NORMALE' ? parseFloat(prix) : 0,
    });
  };

  const types = [
    { value: 'NORMALE', label: 'Course normale', icon: MapPin },
    { value: 'ADY_VAROTRA', label: 'Ady Varotra', icon: DollarSign },
    { value: 'LOCATION_JOURNALIERE', label: 'Location', icon: Bike },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-gray-400 mb-6">
        <ArrowLeft size={20} /> Retour
      </button>
      <h1 className="text-xl font-bold mb-6">Nouvelle course</h1>
      {msg && (
        <div className={`p-3 rounded-lg mb-4 text-center ${msg.includes('Erreur') ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'}`}>
          {msg}
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {types.map((t) => (
          <button
            key={t.value}
            onClick={() => setType(t.value)}
            className={`p-3 rounded-xl flex flex-col items-center gap-1 text-xs transition-colors ${type === t.value ? 'bg-primary text-white' : 'bg-gray-800 text-gray-400'}`}
          >
            <t.icon size={20} /> {t.label}
          </button>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {type === 'NORMALE' ? (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Distance (km)</label>
            <input type="number" value={distance} onChange={(e) => setDistance(e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-lg" placeholder="5" step="0.1" required />
            {distance && <p className="text-center text-sm text-gray-400 mt-2">Prix estimé : {(2000 + parseFloat(distance) * 500).toLocaleString()} Ar</p>}
          </div>
        ) : (
          <div>
            <label className="block text-sm text-gray-400 mb-1">Montant (Ar)</label>
            <input type="number" value={prix} onChange={(e) => setPrix(e.target.value)} className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-center text-lg" placeholder="10000" required />
          </div>
        )}
        <button type="submit" disabled={createCourse.isPending} className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {createCourse.isPending ? 'Enregistrement...' : 'Valider la course'}
        </button>
      </form>
    </div>
  );
}
