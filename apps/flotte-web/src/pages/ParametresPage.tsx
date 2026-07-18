import React, { useState } from 'react';
import { Settings, Save, Sun, Moon, Monitor, Bike, DollarSign, Percent, Calculator, Info } from 'lucide-react';

export const ParametresPage: React.FC = () => {
  const [tab, setTab] = useState<'tarifs' | 'apparence'>('tarifs');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [tarifs, setTarifs] = useState({
    prixBase: 2000,
    prixKm: 500,
    adyVarotra: 5000,
    locationJournaliere: 15000,
    commission: 20,
  });
  const [msg, setMsg] = useState('');

  const save = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('tarifsFlotte', JSON.stringify(tarifs));
    setMsg('✅ Paramètres sauvegardés avec succès');
    setTimeout(() => setMsg(''), 3000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">⚙️ Paramètres</h2>
      </div>

      {msg && (
        <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium flex items-center gap-2 animate-fade-in-up">
          <span>✅</span> {msg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        {[
          { key: 'tarifs' as const, label: '💰 Tarifs', icon: Calculator },
          { key: 'apparence' as const, label: '🎨 Apparence', icon: Sun },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200'
            }`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab Tarifs */}
      {tab === 'tarifs' && (
        <div className="space-y-6">
          {/* Résumé */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Course normale', value: `${tarifs.prixBase.toLocaleString()} Ar`, sub: `+ ${tarifs.prixKm} Ar/km`, icon: '🚖', color: 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' },
              { label: 'Ady Varotra', value: `${tarifs.adyVarotra.toLocaleString()} Ar`, sub: 'Montant libre', icon: '🛺', color: 'border-purple-200 bg-purple-50 dark:bg-purple-900/20' },
              { label: 'Location/jour', value: `${tarifs.locationJournaliere.toLocaleString()} Ar`, sub: 'Sans commission', icon: '📅', color: 'border-green-200 bg-green-50 dark:bg-green-900/20' },
              { label: 'Commission', value: `${tarifs.commission}%`, sub: 'Plateforme', icon: '💼', color: 'border-orange-200 bg-orange-50 dark:bg-orange-900/20' },
            ].map((card, i) => (
              <div key={i} className={`rounded-xl p-4 border text-center ${card.color}`}>
                <div className="text-2xl mb-1">{card.icon}</div>
                <div className="font-bold text-sm">{card.label}</div>
                <div className="text-lg font-extrabold mt-1">{card.value}</div>
                <div className="text-xs text-gray-500">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Formulaire tarifs */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border space-y-5">
            <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign size={20} className="text-orange-500" /> Configuration des tarifs</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">🚖 Prix de base - Course normale</label>
                <div className="relative">
                  <input type="number" value={tarifs.prixBase} onChange={e => setTarifs({...tarifs, prixBase: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-bold text-lg pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Ar</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Montant de base pour une course normale</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">📏 Prix au kilomètre</label>
                <div className="relative">
                  <input type="number" value={tarifs.prixKm} onChange={e => setTarifs({...tarifs, prixKm: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-bold text-lg pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Ar/km</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Tarif par kilomètre parcouru</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">🛺 Ady Varotra (minimum)</label>
                <div className="relative">
                  <input type="number" value={tarifs.adyVarotra} onChange={e => setTarifs({...tarifs, adyVarotra: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-bold text-lg pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Ar</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Montant minimum pour Ady Varotra</p>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">📅 Location journalière <span className="text-green-600 text-xs font-bold">Sans commission</span></label>
                <div className="relative">
                  <input type="number" value={tarifs.locationJournaliere} onChange={e => setTarifs({...tarifs, locationJournaliere: parseInt(e.target.value) || 0})}
                    className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-bold text-lg pr-16" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Ar/jour</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Aucune commission prélevée</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 flex items-center gap-2">
                <Percent size={16} className="text-orange-500" /> Commission plateforme
              </label>
              <div className="relative w-32">
                <input type="number" value={tarifs.commission} onChange={e => setTarifs({...tarifs, commission: parseInt(e.target.value) || 0})}
                  className="w-full p-3 border rounded-xl dark:bg-gray-700 dark:border-gray-600 font-bold text-lg pr-12" min={0} max={100} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">%</span>
              </div>
            </div>

            {/* Tableau récapitulatif */}
            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200">
              <h4 className="font-bold text-sm mb-3 flex items-center gap-2"><Info size={16} /> Récapitulatif - Application Chauffeur</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2">Type</th>
                    <th className="pb-2">Calcul</th>
                    <th className="pb-2">Commission</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-2">🚖 Course normale</td>
                    <td className="py-2">{tarifs.prixBase.toLocaleString()} Ar + (km × {tarifs.prixKm} Ar)</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{tarifs.commission}%</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">🛺 Ady Varotra</td>
                    <td className="py-2">Montant libre (min {tarifs.adyVarotra.toLocaleString()} Ar)</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">{tarifs.commission}%</span></td>
                  </tr>
                  <tr>
                    <td className="py-2">📅 Location journalière</td>
                    <td className="py-2">{tarifs.locationJournaliere.toLocaleString()} Ar/jour</td>
                    <td className="py-2"><span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">0%</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Apparence */}
      {tab === 'apparence' && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Sun size={20} /> Thème</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { key: 'light', icon: Sun, label: '☀️ Clair', desc: 'Thème clair' },
              { key: 'dark', icon: Moon, label: '🌙 Sombre', desc: 'Thème sombre' },
              { key: 'system', icon: Monitor, label: '💻 Système', desc: 'Auto' },
            ].map(t => (
              <button key={t.key} onClick={() => setTheme(t.key)}
                className={`p-4 rounded-xl border-2 transition-all ${theme === t.key ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md' : 'border-gray-200 dark:border-gray-700'}`}>
                <t.icon size={28} className={`mx-auto mb-2 ${theme === t.key ? 'text-orange-500' : 'text-gray-400'}`} />
                <div className="font-bold text-sm">{t.label}</div>
                <div className="text-xs text-gray-400">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bouton sauvegarde */}
      <button onClick={save} className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition-all hover:shadow-lg active:scale-[0.98]">
        <Save size={22} /> Enregistrer tous les paramètres
      </button>
    </div>
  );
};
