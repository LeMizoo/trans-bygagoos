import React from 'react';
import { BarChart3, Download } from 'lucide-react';

export const RapportsPage: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-6">📈 Rapports</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { title: 'Rapport journalier', desc: 'Courses et revenus du jour', icon: BarChart3 },
          { title: 'Rapport mensuel', desc: 'Statistiques du mois en cours', icon: BarChart3 },
          { title: 'Dépenses', desc: 'Récapitulatif des dépenses', icon: Download },
          { title: 'Versements', desc: 'Versements des chauffeurs', icon: Download },
        ].map((r, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border hover:shadow-md transition-all cursor-pointer">
            <r.icon size={32} className="text-orange-500 mb-4" />
            <h3 className="font-bold text-lg">{r.title}</h3>
            <p className="text-sm text-gray-500">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
