import { useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import ClientInfo from './components/ClientInfo';
import Report from './components/Report';
import { AuditData, ClientData } from './types/audit.types';
import './App.css';

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
  const { hapticImpact, isReady } = useTelegram();

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
  if (!isReady) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  return (
    <div className="app-container">
      {step === 1 && <ClientInfo data={auditData.client} update={updateClient} next={nextStep} />}
      {step === 2 && <Report data={auditData} />}
    </div>
  );
}

export default App;