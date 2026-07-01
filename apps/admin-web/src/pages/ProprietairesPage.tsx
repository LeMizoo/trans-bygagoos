import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Building2, Save, Upload, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

export function ProprietairesPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: flotte } = useQuery({
    queryKey: ['ma-flotte'],
    queryFn: () => axios.get(`${API}/flottes`).then(r => {
      const flottes = r.data;
      return flottes.find((f: any) => f.id === user?.flotteId) || null;
    }),
    enabled: !!user?.flotteId,
  });

  const [form, setForm] = useState({ nom: '', email: '', telephone: '', adresse: '', description: '' });

  // Remplir le formulaire quand la flotte est chargée
  useState(() => {
    if (flotte) {
      setForm({
        nom: flotte.nom || '',
        email: flotte.email || '',
        telephone: flotte.telephone || '',
        adresse: flotte.adresse || '',
        description: flotte.description || '',
      });
      if (flotte.logo) setLogoPreview(flotte.logo);
    }
  });

  if (!user?.flotteId) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🏢 Profil Flotte</h1>
        <p className="text-gray-500">Vous n'êtes pas rattaché à une flotte.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
        <Building2 size={24} /> Profil de ma Flotte
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-4">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 size={32} className="text-gray-400" />
            )}
          </div>
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
            <Upload size={14} className="inline mr-1" /> Modifier le logo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = () => setLogoPreview(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
        </div>

        {/* Infos */}
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Nom de la flotte</label>
            <input type="text" value={form.nom} onChange={e => setForm({...form, nom: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl mt-1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"><Mail size={14} /> Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"><Phone size={14} /> Téléphone</label>
              <input type="text" value={form.telephone} onChange={e => setForm({...form, telephone: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl mt-1" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-1"><MapPin size={14} /> Adresse</label>
            <input type="text" value={form.adresse} onChange={e => setForm({...form, adresse: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl mt-1" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border rounded-xl mt-1" rows={3} />
          </div>
        </div>

        <button className="bg-primary text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary/90 flex items-center gap-2">
          <Save size={16} /> Enregistrer
        </button>
      </div>
    </div>
  );
}
