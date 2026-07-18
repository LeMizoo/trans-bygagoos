import React, { useState, useEffect } from 'react';
import { DollarSign, Check, X, Clock, User, Calendar } from 'lucide-react';
import { api } from '../api/client';

export function VersementsPage() {
  const [versements, setVersements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  function loadVersements() {
    api.get('/versements').then(function(res) {
      setVersements(Array.isArray(res.data) ? res.data : []);
    }).finally(function() { setLoading(false); });
  }

  useEffect(function() { loadVersements(); }, []);

  function valider(id: string) {
    api.put('/versements/' + id, { statut: 'VALIDE' }).then(function() {
      setMsg('✅ Versement accepté - Notification envoyée au chauffeur');
      loadVersements();
      setTimeout(function() { setMsg(''); }, 3000);
    });
  }

  function refuser(id: string) {
    var motif = prompt('Motif du refus :');
    api.put('/versements/' + id, { statut: 'REFUSE', commentaire: motif || '' }).then(function() {
      setMsg('❌ Versement refusé');
      loadVersements();
      setTimeout(function() { setMsg(''); }, 3000);
    });
  }

  var enAttente = versements.filter(function(v: any) { return !v.statut || v.statut === 'EN_ATTENTE'; });
  var valides = versements.filter(function(v: any) { return v.statut === 'VALIDE'; });
  var total = versements.reduce(function(s: number, v: any) { return s + (v.montant || 0); }, 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div></div>;

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">💵 Demandes de versement</h2>
        <p className="text-gray-500">{enAttente.length} en attente · {valides.length} validé(s) · Total: {total.toLocaleString()} Ar</p>
      </div>

      {msg && <div className={'mb-4 p-3 rounded-xl ' + (msg.startsWith('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{msg}</div>}

      {versements.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border">
          <DollarSign size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-400">Aucune demande de versement</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versements.map(function(v: any) {
            var estEnAttente = !v.statut || v.statut === 'EN_ATTENTE';
            return (
              <div key={v.id} className="bg-white dark:bg-gray-800 rounded-xl p-4 border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={'w-10 h-10 rounded-xl flex items-center justify-center ' + (v.statut === 'VALIDE' ? 'bg-green-100' : v.statut === 'REFUSE' ? 'bg-red-100' : 'bg-yellow-100')}>
                    <DollarSign size={20} className={v.statut === 'VALIDE' ? 'text-green-600' : 'text-yellow-600'} />
                  </div>
                  <div>
                    <div className="font-bold text-green-600">+{(v.montant || 0).toLocaleString()} Ar</div>
                    <div className="text-sm text-gray-500">{v.mode || 'N/A'} · {v.reference || 'N/A'}</div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <User size={12} /> {v.user?.nom || 'N/A'} · <Calendar size={12} /> {v.date ? new Date(v.date).toLocaleDateString('fr') : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {estEnAttente ? (
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <Clock size={12} /> En attente
                    </span>
                  ) : v.statut === 'VALIDE' ? (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <Check size={12} /> Accepté
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1">
                      <X size={12} /> Refusé
                    </span>
                  )}
                  {estEnAttente && (
                    <>
                      <button onClick={function() { valider(v.id); }} className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Accepter">
                        <Check size={16} />
                      </button>
                      <button onClick={function() { refuser(v.id); }} className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Refuser">
                        <X size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
