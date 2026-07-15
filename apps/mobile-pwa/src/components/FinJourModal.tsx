import { useState } from 'react';

interface FinJourModalProps {
  kmDebut: string;
  distanceJour: number;
  setDistanceJour: (v: number) => void;
  setShowConfirm: (v: boolean) => void;
  pointer: any;
}

export default function FinJourModal({ kmDebut, distanceJour, setDistanceJour, setShowConfirm, pointer }: FinJourModalProps) {
  const [kmFin, setKmFin] = useState('');

  const handleKmChange = (val: string) => {
    setKmFin(val);
    if (kmDebut && val) {
      const d = parseFloat(val) - parseFloat(kmDebut);
      setDistanceJour(d > 0 ? d : 0);
    } else {
      setDistanceJour(0);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ color: '#DAA520', marginBottom: 12 }}>🏁 Terminer la journée ?</h3>
        <div className="form-group">
          <input
            type="number"
            value={kmFin}
            onChange={e => handleKmChange(e.target.value)}
            placeholder="🏍️ KM au compteur (arrivée)"
            style={{
              width: '100%', padding: 10, background: '#252525',
              border: '1px solid #333', borderRadius: 10, color: '#fff', fontSize: 14
            }}
          />
        </div>
        {distanceJour > 0 && (
          <div style={{ textAlign: 'center', padding: 10, background: '#1a2a1a', borderRadius: 10, marginBottom: 8 }}>
            📏 Distance totale : <strong style={{ color: '#2ecc71' }}>{distanceJour.toFixed(1)} km</strong>
          </div>
        )}
        {kmDebut && (
          <div style={{ textAlign: 'center', padding: 8, fontSize: 11, color: '#888' }}>
            KM départ: {kmDebut} → KM arrivée: {kmFin || '?'}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setShowConfirm(false); setKmFin(''); setDistanceJour(0); }}
            style={{
              flex: 1, padding: 12, background: '#333', border: 'none',
              borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => { pointer.mutate('FIN_SERVICE'); setShowConfirm(false); }}
            style={{
              flex: 1, padding: 12, background: '#e74c3c', border: 'none',
              borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer'
            }}
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
