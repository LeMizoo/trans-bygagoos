import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Bike, DollarSign, TrendingUp, Calendar, AlertTriangle, Eye, Edit3, Clock } from 'lucide-react';
import { api } from '../../api/client';

export const ChauffeursPage: React.FC = () => {
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [depenses, setDepenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const flotteId = user.flotteId || user.flotte?.id;
    
    if (flotteId) {
      Promise.all([
        api.get(`/flottes/${flotteId}`),
        api.get('/courses'),
        api.get('/depenses'),
      ]).then(([flotteRes, coursesRes, depensesRes]) => {
        const users = flotteRes.data.users || [];
        setChauffeurs(users.filter((u: any) => u.role === 'CHAUFFEUR'));
        setCourses(Array.isArray(coursesRes.data) ? coursesRes.data : []);
        setDepenses(Array.isArray(depensesRes.data) ? depensesRes.data : []);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Calculer les stats par chauffeur
  const chauffeursWithStats = chauffeurs.map(c => {
    const coursesChauffeur = courses.filter(co => co.userId === c.id);
    const todayCourses = coursesChauffeur.filter(co => new Date(co.dateCourse).toDateString() === new Date().toDateString());
    const weekCourses = coursesChauffeur.filter(co => {
      const d = new Date(co.dateCourse);
      const now = new Date();
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      return d >= weekAgo;
    });
    const monthCourses = coursesChauffeur.filter(co => {
      const d = new Date(co.dateCourse);
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    });
    const depensesChauffeur = depenses.filter(d => d.userId === c.id);
    const todayDepenses = depensesChauffeur.filter(d => new Date(d.date).toDateString() === new Date().toDateString());

    return {
      ...c,
      nbCoursesJour: todayCourses.length,
      caJour: todayCourses.reduce((s, co) => s + (co.prix || 0), 0),
      commissionJour: Math.round(todayCourses.reduce((s, co) => s + (co.prix || 0), 0) * 0.2),
      nbCoursesSemaine: weekCourses.length,
      caSemaine: weekCourses.reduce((s, co) => s + (co.prix || 0), 0),
      nbCoursesMois: monthCourses.length,
      caMois: monthCourses.reduce((s, co) => s + (co.prix || 0), 0),
      commissionMois: Math.round(monthCourses.reduce((s, co) => s + (co.prix || 0), 0) * 0.2),
      depensesJour: todayDepenses.reduce((s, d) => s + (d.montant || 0), 0),
      depensesMois: depensesChauffeur.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).reduce((s, d) => s + (d.montant || 0), 0),
      gainNetJour: Math.round(todayCourses.reduce((s, co) => s + (co.prix || 0), 0) * 0.2) - todayDepenses.reduce((s, d) => s + (d.montant || 0), 0),
      gainNetMois: Math.round(monthCourses.reduce((s, co) => s + (co.prix || 0), 0) * 0.2) - depensesChauffeur.filter(d => new Date(d.date).getMonth() === new Date().getMonth()).reduce((s, d) => s + (d.montant || 0), 0),
    };
  });

  const filtered = chauffeursWithStats.filter(c => 
    c.nom?.toLowerCase().includes(search.toLowerCase()) ||
    c.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    c.codeAcces?.toLowerCase().includes(search.toLowerCase())
  );

  // Totaux
  const totalCAJour = filtered.reduce((s, c) => s + c.caJour, 0);
  const totalCommissionJour = filtered.reduce((s, c) => s + c.commissionJour, 0);
  const totalGainNetJour = filtered.reduce((s, c) => s + c.gainNetJour, 0);
  const totalCoursesJour = filtered.reduce((s, c) => s + c.nbCoursesJour, 0);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 max-w-full mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold">👤 Gestion des chauffeurs</h2>
          <p className="text-gray-500">{filtered.length} chauffeur(s) actif(s)</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." 
              className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 w-56" />
          </div>
        </div>
      </div>

      {/* Mini Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Chauffeurs actifs', value: filtered.length, icon: Users, color: 'bg-orange-100 text-orange-700' },
          { label: 'CA aujourd\'hui', value: `${totalCAJour.toLocaleString()} Ar`, icon: DollarSign, color: 'bg-green-100 text-green-700' },
          { label: 'Commission jour', value: `${totalCommissionJour.toLocaleString()} Ar`, icon: TrendingUp, color: 'bg-amber-100 text-amber-700' },
          { label: 'Gain net jour', value: `${totalGainNetJour.toLocaleString()} Ar`, icon: DollarSign, color: totalGainNetJour >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl p-4 border text-center">
            <s.icon size={20} className={`mx-auto mb-1 ${s.color} p-1 rounded-lg`} />
            <div className="text-xl font-bold">{s.value}</div>
            <div className="text-xs text-gray-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tableau */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400">
                <th className="text-left py-3 px-4 font-semibold">Chauffeur</th>
                <th className="text-center py-3 px-4 font-semibold">Code</th>
                <th className="text-center py-3 px-4 font-semibold">📅 Aujourd'hui</th>
                <th className="text-center py-3 px-4 font-semibold">📆 Semaine</th>
                <th className="text-center py-3 px-4 font-semibold">📅 Mois</th>
                <th className="text-center py-3 px-4 font-semibold">💰 Gain net/jour</th>
                <th className="text-center py-3 px-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-gray-400">Aucun chauffeur</td></tr>
              ) : (
                filtered.map(c => (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold">{c.nom} {c.prenom}</div>
                      <div className="text-xs text-gray-400">📱 {c.telephone || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">{c.codeAcces || '---'}</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold text-amber-600">{c.commissionJour.toLocaleString()} Ar</div>
                      <div className="text-xs text-gray-400">{c.nbCoursesJour} courses</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold">{c.caSemaine.toLocaleString()} Ar</div>
                      <div className="text-xs text-gray-400">{c.nbCoursesSemaine} courses</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="font-bold">{c.commissionMois.toLocaleString()} Ar</div>
                      <div className="text-xs text-gray-400">{c.nbCoursesMois} courses</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className={`font-bold ${c.gainNetJour >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {c.gainNetJour.toLocaleString()} Ar
                      </div>
                      <div className="text-xs text-gray-400">📊 {c.gainNetMois.toLocaleString()} Ar/mois</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button className="p-1.5 hover:bg-gray-100 rounded-lg" title="Voir"><Eye size={14} /></button>
                        <button className="p-1.5 hover:bg-amber-100 rounded-lg text-amber-600" title="Modifier"><Edit3 size={14} /></button>
                        <button className="p-1.5 hover:bg-blue-100 rounded-lg text-blue-600" title="Pointages"><Clock size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-orange-50/50 dark:bg-orange-900/10 font-bold">
                  <td className="py-3 px-4">TOTAUX</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center text-amber-600">{totalCommissionJour.toLocaleString()} Ar</td>
                  <td className="py-3 px-4 text-center">{filtered.reduce((s, c) => s + c.caSemaine, 0).toLocaleString()} Ar</td>
                  <td className="py-3 px-4 text-center">{filtered.reduce((s, c) => s + c.commissionMois, 0).toLocaleString()} Ar</td>
                  <td className="py-3 px-4 text-center">{totalGainNetJour.toLocaleString()} Ar</td>
                  <td className="py-3 px-4 text-center">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border text-sm text-gray-500 flex flex-wrap gap-4">
        <span>🟢 <b>Gain net positif</b> = Commission - Dépenses</span>
        <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">CODE</span>
        <span>= Code d'accès application</span>
        <span>📅 = Aujourd'hui | 📆 = Cette semaine | 📅 = Ce mois</span>
      </div>
    </div>
  );
};
