import { useState } from 'react';
import { ClientData } from '../types/audit.types';

interface ClientInfoProps {
  data: ClientData;
  update: (data: Partial<ClientData>) => void;
  next: () => void;
}

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
    <form onSubmit={handleSubmit} className="form-container">
      <h2>📝 Audit ma'lumotlari</h2>
      
      {/* I. Umumiy ma'lumot */}
      <div className="form-section">
        <h3>I. Umumiy ma'lumot</h3>
        
        <div className="form-group">
          <label>Ob'ekt joylashgan manzili *</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            placeholder="Viloyat, tuman, ko'cha, uy raqami"
          />
        </div>

        <div className="form-group">
          <label>Xonadon egasi *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Ism Familiya"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Telefon raqami *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="+998 XX XXX XX XX"
            />
          </div>
          <div className="form-group">
            <label>Foydalanuvchilar soni *</label>
            <input
              type="text"
              name="residentsCount"
              value={formData.residentsCount}
              onChange={handleChange}
              required
              placeholder="Masalan: 6 нафар"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Qurilgan yili *</label>
            <input
              type="text"
              name="buildYear"
              value={formData.buildYear}
              onChange={handleChange}
              required
              placeholder="Masalan: 2001"
            />
          </div>
          <div className="form-group">
            <label>Oxirgi ta'mirlangan yil *</label>
            <input
              type="text"
              name="lastRepairYear"
              value={formData.lastRepairYear}
              onChange={handleChange}
              required
              placeholder="Masalan: 2016"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Binolar soni *</label>
            <input
              type="text"
              name="buildingCount"
              value={formData.buildingCount}
              onChange={handleChange}
              required
              placeholder="Masalan: 1"
            />
          </div>
          <div className="form-group">
            <label>Qavatligi *</label>
            <input
              type="text"
              name="floorCount"
              value={formData.floorCount}
              onChange={handleChange}
              required
              placeholder="Masalan: 1-қават"
            />
          </div>
          <div className="form-group">
            <label>Xonalar soni *</label>
            <input
              type="text"
              name="roomCount"
              value={formData.roomCount}
              onChange={handleChange}
              required
              placeholder="Masalan: 5"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Foydalanish maqsadi *</label>
          <select name="usagePurpose" value={formData.usagePurpose} onChange={handleChange} required>
            <option value="">Tanlang</option>
            <option value="Турар жой">🏠 Турар жой</option>
            <option value="Нотурар жой">🏭 Нотурар жой</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-next">Keyingi →</button>
    </form>
  );
}