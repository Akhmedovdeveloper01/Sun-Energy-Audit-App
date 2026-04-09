import { useState, useEffect } from 'react';
import { useTelegram } from './hooks/useTelegram';
import ClientInfo from './components/ClientInfo';
import Report from './components/Report';
import { AuditData, ClientData } from './types/audit.types';
import './App.css';

// ─── Ruxsatli ID lar ─────────────────────────────────────────────────────────
const ALLOWED_IDS = [
  1727203202,
  873890399
];

const initialAuditData: AuditData = {
  client: {
    fullName: '',
    phone: '',
    address: '',
    residentsCount: '',
    buildYear: '',
    lastRepairYear: '',
    buildingCount: '',
    floorCount: '',
    roomCount: '',
    usagePurpose: ''
  },
  startedAt: new Date().toISOString(),
  completedAt: undefined
};

function App() {
  const [step, setStep] = useState<number>(1);
  const [auditData, setAuditData] = useState<AuditData>(initialAuditData);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const { hapticImpact, isReady, tg } = useTelegram();

  useEffect(() => {
    if (!isReady) return;
    const chatId = tg?.initDataUnsafe?.user?.id;
    if (!chatId) {
      setAllowed(false);
      return;
    }
    setAllowed(ALLOWED_IDS.includes(Number(chatId)));
  }, [isReady, tg]);

  const updateClient = (clientData: Partial<ClientData>) => {
    setAuditData(prev => ({
      ...prev,
      client: { ...prev.client, ...clientData }
    }));
    hapticImpact('light');
  };

  const nextStep = () => {
    setStep(prev => prev + 1);
    hapticImpact('medium');
  };

  // Yuklanmoqda
  if (!isReady || allowed === null) {
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        height: '100vh', fontFamily: 'sans-serif',
      }}>
        <p>⏳ Yuklanmoqda...</p>
      </div>
    );
  }

  // Ruxsat yo'q
  if (!allowed) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        alignItems: 'center', height: '100vh', fontFamily: 'sans-serif',
        padding: '24px', textAlign: 'center',
      }}>
        <div style={{ fontSize: '56px', marginBottom: '16px' }}>🔒</div>
        <h2 style={{ margin: '0 0 10px', color: '#333' }}>Kirish taqiqlangan</h2>
        <p style={{ color: '#666', marginBottom: '8px', lineHeight: 1.5 }}>
          Sizda ushbu xizmatdan foydalanish huquqi yo'q.
        </p>
        <p style={{ color: '#666', lineHeight: 1.5 }}>
          Telegram ID ni adminga yuboring<br />
        </p>
      </div>
    );
  }

  return (
    <div className="app-container">
      {step === 1 && <ClientInfo data={auditData.client} update={updateClient} next={nextStep} />}
      {step === 2 && <Report data={auditData} />}
    </div>
  );
}

export default App;