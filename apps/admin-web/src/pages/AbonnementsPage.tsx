import { CreditCard } from 'lucide-react';

export function AbonnementsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">💳 Abonnements</h1>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <CreditCard size={48} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Gestion des abonnements</h2>
        <p className="text-gray-500">Cette fonctionnalité sera disponible prochainement.</p>
      </div>
    </div>
  );
}
