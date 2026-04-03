import { useState } from 'react';
import { ChecklistAnswers } from '../types/audit.types';

interface ChecklistProps {
  data: ChecklistAnswers;
  update: (data: Partial<ChecklistAnswers>) => void;
  next: () => void;
  prev: () => void;
}

export default function Checklist({ data, update, next, prev }: ChecklistProps) {
  const [answers, setAnswers] = useState<ChecklistAnswers>(data);

  const handleChange = (id: keyof ChecklistAnswers, value: string) => {
    const newAnswers = { ...answers, [id]: value };
    setAnswers(newAnswers);
    update(newAnswers);
  };

  const isComplete = () => {
    const required = ['roof_area_sufficient', 'roof_condition', 'sun_exposure', 'shade_condition', 'roof_angle', 'wind_load'];
    return required.every(key => answers[key as keyof ChecklistAnswers] !== null);
  };

  return (
    <div className="checklist-container">
      <h2>📋 Tom va quyosh paneli audit</h2>
      <p>Yuborgan rasmlarga asoslanib baholang</p>

      <div className="checklist-item">
        <p className="question">🏠 Tom maydoni panel o'rnatish uchun yetarlimi?</p>
        <div className="yesno-buttons">
          <button className={`btn-yes ${answers.roof_area_sufficient === 'yes' ? 'active' : ''}`}
            onClick={() => handleChange('roof_area_sufficient', 'yes')}>✅ Ha</button>
          <button className={`btn-no ${answers.roof_area_sufficient === 'no' ? 'active' : ''}`}
            onClick={() => handleChange('roof_area_sufficient', 'no')}>❌ Yo‘q</button>
        </div>
      </div>

      <div className="checklist-item">
        <p className="question">🏚️ Tomning umumiy holati qanday?</p>
        <div className="rating-options">
          <button className={`option ${answers.roof_condition === 'good' ? 'active' : ''}`}
            onClick={() => handleChange('roof_condition', 'good')}>✅ Yaxshi</button>
          <button className={`option ${answers.roof_condition === 'average' ? 'active' : ''}`}
            onClick={() => handleChange('roof_condition', 'average')}>⚠️ O‘rtacha</button>
          <button className={`option ${answers.roof_condition === 'bad' ? 'active' : ''}`}
            onClick={() => handleChange('roof_condition', 'bad')}>❌ Yomon</button>
        </div>
      </div>

      <div className="checklist-item">
        <p className="question">☀️ Tomga quyosh tushishi qanday?</p>
        <div className="rating-options">
          <button className={`option ${answers.sun_exposure === 'good' ? 'active' : ''}`}
            onClick={() => handleChange('sun_exposure', 'good')}>✅ Yaxshi (kun bo'yi)</button>
          <button className={`option ${answers.sun_exposure === 'average' ? 'active' : ''}`}
            onClick={() => handleChange('sun_exposure', 'average')}>⚠️ O‘rtacha (yarim kun)</button>
          <button className={`option ${answers.sun_exposure === 'bad' ? 'active' : ''}`}
            onClick={() => handleChange('sun_exposure', 'bad')}>❌ Yomon (kam)</button>
        </div>
      </div>

      <div className="checklist-item">
        <p className="question">🌳 Tomga soya tushadimi?</p>
        <div className="rating-options">
          <button className={`option ${answers.shade_condition === 'none' ? 'active' : ''}`}
            onClick={() => handleChange('shade_condition', 'none')}>✅ Soya yo‘q</button>
          <button className={`option ${answers.shade_condition === 'partial' ? 'active' : ''}`}
            onClick={() => handleChange('shade_condition', 'partial')}>⚠️ Qisman</button>
          <button className={`option ${answers.shade_condition === 'heavy' ? 'active' : ''}`}
            onClick={() => handleChange('shade_condition', 'heavy')}>❌ Kuchli soya</button>
        </div>
      </div>

      <div className="checklist-item">
        <p className="question">📐 Tomning nishablik burchagi panel uchun qulaymi?</p>
        <div className="rating-options">
          <button className={`option ${answers.roof_angle === 'optimal' ? 'active' : ''}`}
            onClick={() => handleChange('roof_angle', 'optimal')}>✅ Optimal (25-35°)</button>
          <button className={`option ${answers.roof_angle === 'acceptable' ? 'active' : ''}`}
            onClick={() => handleChange('roof_angle', 'acceptable')}>⚠️ Qabul qilinadi</button>
          <button className={`option ${answers.roof_angle === 'poor' ? 'active' : ''}`}
            onClick={() => handleChange('roof_angle', 'poor')}>❌ Yaroqsiz</button>
        </div>
      </div>

      <div className="checklist-item">
        <p className="question">💨 Hudoddagi shamol yuklamasi qanday?</p>
        <div className="rating-options">
          <button className={`option ${answers.wind_load === 'low' ? 'active' : ''}`}
            onClick={() => handleChange('wind_load', 'low')}>✅ Kam</button>
          <button className={`option ${answers.wind_load === 'medium' ? 'active' : ''}`}
            onClick={() => handleChange('wind_load', 'medium')}>⚠️ O‘rtacha</button>
          <button className={`option ${answers.wind_load === 'high' ? 'active' : ''}`}
            onClick={() => handleChange('wind_load', 'high')}>❌ Kuchli</button>
        </div>
      </div>

      <div className="checklist-item">
        <p className="question">📝 Qo'shimcha izohlar</p>
        <textarea
          className="notes-input"
          value={answers.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          placeholder="Tom, atrof yoki boshqa kuzatishlar..."
        />
      </div>

      <div className="button-group">
        <button onClick={prev} className="btn-prev">← Orqaga</button>
        <button onClick={next} className="btn-next" disabled={!isComplete()}>
          Keyingi →
        </button>
      </div>
    </div>
  );
}