import { BarChart3, FileText, Download } from 'lucide-react';

export function RapportsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📊 Rapports</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <FileText size={48} className="mx-auto mb-3 text-primary" />
          <h3 className="font-semibold">Rapport journalier</h3>
          <p className="text-sm text-gray-500">Courses, CA, commissions du jour</p>
          <button className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 mx-auto"><Download size={14} /> Exporter PDF</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <BarChart3 size={48} className="mx-auto mb-3 text-green-500" />
          <h3 className="font-semibold">Rapport mensuel</h3>
          <p className="text-sm text-gray-500">Synthèse du mois en cours</p>
          <button className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg text-sm flex items-center gap-2 mx-auto"><Download size={14} /> Exporter Excel</button>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border p-6 text-center hover:shadow-lg transition-shadow cursor-pointer">
          <FileText size={48} className="mx-auto mb-3 text-purple-500" />
          <h3 className="font-semibold">Rapport chauffeurs</h3>
          <p className="text-sm text-gray-500">Performance par chauffeur</p>
          <button className="mt-3 px-4 py-2 bg-purple-500 text-white rounded-lg text-sm flex items-center gap-2 mx-auto"><Download size={14} /> Exporter CSV</button>
        </div>
      </div>
    </div>
  );
}
