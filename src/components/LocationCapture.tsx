import { useState } from 'react';
import { AuditData } from '../types/audit.types';

interface LocationCaptureProps {
  data: AuditData['location'];
  update: (location: AuditData['location']) => void;
  next: () => void;
  prev: () => void;
}

export default function LocationCapture({ data, update, next, prev }: LocationCaptureProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [location, setLocation] = useState(data);

  const getLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert('Bu brauzer GPS ni qo‘llab-quvvatlamaydi');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          timestamp: new Date().toISOString()
        };
        setLocation(newLocation);
        update(newLocation);
        setLoading(false);
      },
      (error) => {
        alert('GPS xatolik: ' + error.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="location-capture">
      <h2>📍 Ob’ekt joylashuvi</h2>
      
      {!location && (
        <button onClick={getLocation} disabled={loading} className="btn-gps">
          {loading ? '⏳ Joylashuv olinmoqda...' : '📍 GPS koordinatani olish'}
        </button>
      )}
      
      {location && (
        <div className="location-info">
          <p><strong>Kenglik:</strong> {location.lat}</p>
          <p><strong>Uzunlik:</strong> {location.lng}</p>
          <p><strong>Vaqt:</strong> {new Date(location.timestamp).toLocaleString()}</p>
          <button onClick={() => {
            setLocation(null);
            update(null);
          }} className="btn-reset">
            🔄 Qayta olish
          </button>
        </div>
      )}
      
      <div className="button-group">
        <button onClick={prev} className="btn-prev">← Orqaga</button>
        <button onClick={next} className="btn-next" disabled={!location}>
          Yakunlash →
        </button>
      </div>
    </div>
  );
}