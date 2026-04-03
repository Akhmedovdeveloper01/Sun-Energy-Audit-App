import { useState } from 'react';
import { useTelegram } from './hooks/useTelegram';
import ClientInfo from './components/ClientInfo';
// import Checklist from './components/Checklist';
// import PhotoCapture from './components/PhotoCapture';
// import LocationCapture from './components/LocationCapture';
import Report from './components/Report';
// import { AuditData, ClientData, ChecklistAnswers } from './types/audit.types';
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
  // checklist: {
  //   roof_area_sufficient: null,
  //   roof_condition: null,
  //   sun_exposure: null,
  //   shade_condition: null,
  //   roof_angle: null,
  //   wind_load: null,
  //   notes: ''
  // },
  // photos: [],
  // location: null,
  startedAt: new Date().toISOString(),
  completedAt: undefined
};

function App() {
  const [step, setStep] = useState<number>(1);
  const [auditData, setAuditData] = useState<AuditData>(initialAuditData);
  // const { themeParams, showAlert, hapticImpact, isReady } = useTelegram();
  const { themeParams, hapticImpact, isReady } = useTelegram();

  const updateClient = (clientData: Partial<ClientData>) => {
    setAuditData(prev => ({
      ...prev,
      client: { ...prev.client, ...clientData }
    }));
    hapticImpact('light');
  };

  // const updateChecklist = (checklistData: Partial<ChecklistAnswers>) => {
  //   setAuditData(prev => ({
  //     ...prev,
  //     checklist: { ...prev.checklist, ...checklistData } as ChecklistAnswers
  //   }));
  //   hapticImpact('light');
  // };

  // const updatePhotos = (photos: string[]) => {
  //   setAuditData(prev => ({ ...prev, photos }));
  //   hapticImpact('light');
  // };

  // const updateLocation = (location: AuditData['location']) => {
  //   setAuditData(prev => ({ ...prev, location }));
  //   hapticImpact('light');
  // };

  const nextStep = () => {
    setStep(prev => prev + 1);
    hapticImpact('medium');
  };

  // const prevStep = () => {
  //   setStep(prev => prev - 1);
  //   hapticImpact('light');
  // };

  // const completeAudit = () => {
  //   setAuditData(prev => ({ ...prev, completedAt: new Date().toISOString() }));
  //   setStep(5);
  //   hapticImpact('heavy');
  //   showAlert('Audit muvaffaqiyatli yakunlandi!');
  // };

  if (!isReady) {
    return <div className="loading">Yuklanmoqda...</div>;
  }

  return (
    <div className="app-container" style={{ backgroundColor: themeParams?.bg_color || '#fff' }}>
      <div className="step">Qadam {step} / 2</div>

      {step === 1 && <ClientInfo data={auditData.client} update={updateClient} next={nextStep} />}
      {/* {step === 2 && <Checklist data={auditData.checklist} update={updateChecklist} next={nextStep} prev={prevStep} />} */}
      {/* {step === 2 && <PhotoCapture data={auditData.photos} update={updatePhotos} next={nextStep} prev={prevStep} />} */}
      {/* {step === 2 && <LocationCapture data={auditData.location} update={updateLocation} next={completeAudit} prev={prevStep} />} */}
      {step === 2 && <Report data={auditData} />}
    </div>
  );
}

export default App;