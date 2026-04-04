import { useState } from 'react';
import { ClientData } from '../types/audit.types';

interface ClientInfoProps {
  data: ClientData;
  update: (data: Partial<ClientData>) => void;
  next: () => void;
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');

  .ci-wrap {
    font-family: 'Nunito', sans-serif;
    padding: 16px;
    max-width: 480px;
    margin: 0 auto;
    background: #f0f4ff;
    min-height: 100vh;
  }

  .ci-header {
    background: linear-gradient(135deg, #3b5bdb 0%, #7048e8 100%);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    color: white;
    display: flex;
    align-items: center;
    gap: 14px;
    box-shadow: 0 8px 24px rgba(59,91,219,0.3);
  }

  .ci-header-icon {
    width: 48px;
    height: 48px;
    background: rgba(255,255,255,0.2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    flex-shrink: 0;
  }

  .ci-header h2 {
    margin: 0 0 2px;
    font-size: 18px;
    font-weight: 800;
    letter-spacing: -0.3px;
  }

  .ci-header p {
    margin: 0;
    font-size: 12px;
    opacity: 0.8;
    font-weight: 600;
  }

  .ci-card {
    background: white;
    border-radius: 20px;
    padding: 18px;
    margin-bottom: 14px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  }

  .ci-section-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #3b5bdb;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 16px;
    padding-bottom: 10px;
    border-bottom: 2px solid #eef0ff;
  }

  .ci-field {
    margin-bottom: 14px;
  }

  .ci-field:last-child {
    margin-bottom: 0;
  }

  .ci-label {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    font-weight: 700;
    color: #868e96;
    margin-bottom: 6px;
    text-transform: uppercase;
    letter-spacing: 0.4px;
  }

  .ci-label span {
    color: #f03e3e;
  }

  .ci-input {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    color: #212529;
    background: #f8f9ff;
    box-sizing: border-box;
    transition: all 0.2s ease;
    outline: none;
    -webkit-appearance: none;
  }

  .ci-input:focus {
    border-color: #3b5bdb;
    background: white;
    box-shadow: 0 0 0 4px rgba(59,91,219,0.1);
  }

  .ci-input::placeholder {
    color: #ced4da;
    font-weight: 500;
  }

  .ci-select {
    width: 100%;
    padding: 12px 14px;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    font-size: 15px;
    font-family: 'Nunito', sans-serif;
    font-weight: 600;
    color: #212529;
    background: #f8f9ff;
    box-sizing: border-box;
    transition: all 0.2s ease;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%233b5bdb' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }

  .ci-select:focus {
    border-color: #3b5bdb;
    background-color: white;
    box-shadow: 0 0 0 4px rgba(59,91,219,0.1);
  }

  .ci-row {
    display: grid;
    gap: 10px;
  }

  .ci-row-2 { grid-template-columns: 1fr 1fr; }
  .ci-row-3 { grid-template-columns: 1fr 1fr 1fr; }

  .ci-submit {
    width: 100%;
    padding: 16px;
    background: linear-gradient(135deg, #3b5bdb 0%, #7048e8 100%);
    color: white;
    border: none;
    border-radius: 16px;
    font-size: 16px;
    font-family: 'Nunito', sans-serif;
    font-weight: 800;
    cursor: pointer;
    margin-top: 8px;
    box-shadow: 0 6px 20px rgba(59,91,219,0.35);
    transition: all 0.2s ease;
    letter-spacing: 0.3px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .ci-submit:active {
    transform: scale(0.98);
    box-shadow: 0 3px 10px rgba(59,91,219,0.25);
  }

  .ci-required-note {
    text-align: center;
    font-size: 11px;
    color: #adb5bd;
    font-weight: 600;
    margin-top: 10px;
  }

  .ci-required-note span {
    color: #f03e3e;
  }
`;

export default function ClientInfo({ data, update, next }: ClientInfoProps) {
  const [formData, setFormData] = useState<ClientData>(data);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    update(formData);
    next();
  };

  return (
    <>
      <style>{styles}</style>
      <div className="ci-wrap">

        {/* Header */}
        <div className="ci-header">
          <div className="ci-header-icon">📋</div>
          <div>
            <h2>Audit ma'lumotlari</h2>
            <p>Umumiy ma'lumotlarni to'ldiring</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* Manzil va egasi */}
          <div className="ci-card">
            <div className="ci-section-title">
              🏠 Ob'ekt ma'lumotlari
            </div>

            <div className="ci-field">
              <div className="ci-label">Manzil <span>*</span></div>
              <input className="ci-input" type="text" name="address"
                value={formData.address || ''}
                onChange={handleChange} required
                placeholder="Viloyat, tuman, ko'cha, uy №" />
            </div>

            <div className="ci-field">
              <div className="ci-label">Xonadon egasi <span>*</span></div>
              <input className="ci-input" type="text" name="fullName"
                value={formData.fullName || ''}
                onChange={handleChange} required
                placeholder="Ism Familiya Sharif" />
            </div>

            <div className="ci-row ci-row-2">
              <div className="ci-field">
                <div className="ci-label">Telefon <span>*</span></div>
                <input className="ci-input" type="tel" name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange} required
                  placeholder="+998 90 000 00 00" />
              </div>
              <div className="ci-field">
                <div className="ci-label">Foydalanuvchilar <span>*</span></div>
                <input className="ci-input" type="text" name="residentsCount"
                  value={formData.residentsCount || ''}
                  onChange={handleChange} required
                  placeholder="6 nafar" />
              </div>
            </div>
          </div>

          {/* Qurilish ma'lumotlari */}
          <div className="ci-card">
            <div className="ci-section-title">
              🏗 Qurilish ma'lumotlari
            </div>

            <div className="ci-row ci-row-2">
              <div className="ci-field">
                <div className="ci-label">Qurilgan yili <span>*</span></div>
                <input className="ci-input" type="text" name="buildYear"
                  value={formData.buildYear || ''}
                  onChange={handleChange} required
                  placeholder="2001" />
              </div>
              <div className="ci-field">
                <div className="ci-label">Ta'mirlangan yil <span>*</span></div>
                <input className="ci-input" type="text" name="lastRepairYear"
                  value={formData.lastRepairYear || ''}
                  onChange={handleChange} required
                  placeholder="2016" />
              </div>
            </div>

            <div className="ci-row ci-row-3">
              <div className="ci-field">
                <div className="ci-label">Binolar <span>*</span></div>
                <input className="ci-input" type="text" name="buildingCount"
                  value={formData.buildingCount || ''}
                  onChange={handleChange} required
                  placeholder="1" />
              </div>
              <div className="ci-field">
                <div className="ci-label">Qavatlar <span>*</span></div>
                <input className="ci-input" type="text" name="floorCount"
                  value={formData.floorCount || ''}
                  onChange={handleChange} required
                  placeholder="2" />
              </div>
              <div className="ci-field">
                <div className="ci-label">Xonalar <span>*</span></div>
                <input className="ci-input" type="text" name="roomCount"
                  value={formData.roomCount || ''}
                  onChange={handleChange} required
                  placeholder="5" />
              </div>
            </div>

            <div className="ci-field">
              <div className="ci-label">Foydalanish maqsadi <span>*</span></div>
              <select className="ci-select" name="usagePurpose"
                value={formData.usagePurpose || ''}
                onChange={handleChange} required>
                <option value="">— Tanlang —</option>
                <option value="Turar joy">🏠 Turar joy</option>
                <option value="Noturar joy">🏭 Noturar joy</option>
              </select>
            </div>
          </div>

          <button type="submit" className="ci-submit">
            Keyingiga o'tish
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <p className="ci-required-note"><span>*</span> — majburiy maydonlar</p>
        </form>
      </div>
    </>
  );
}