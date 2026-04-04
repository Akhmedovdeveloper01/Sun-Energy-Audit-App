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
      <h2 className='text-white'>📝 Audit ma'lumotlari</h2>

      {/* I. Umumiy ma'lumot */}
      <div className="form-section">
        <h3 className='text-white'>I. Umumiy ma'lumot</h3>

        <div className="form-group">
          <label className='text-white'>Ob'ekt joylashgan manzili *</label>
          <input
            type="text"
            name="address"
            value={formData.address || 'Sarbon'}
            onChange={handleChange}
            required
            placeholder="Viloyat, tuman, ko'cha, uy raqami"
          />
        </div>

        <div className="form-group">
          <label className='text-white'>Xonadon egasi *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName ||
              "Mahmud Ahmedov"}
            onChange={handleChange}
            required
            placeholder="Ism Familiya"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className='text-white'>Telefon raqami *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone || "+998913315598"}
              onChange={handleChange}
              required
              placeholder="+998 XX XXX XX XX"
            />
          </div>
          <div className="form-group">
            <label className='text-white'>Foydalanuvchilar soni *</label>
            <input
              type="text"
              name="residentsCount"
              value={formData.residentsCount || "7"}
              onChange={handleChange}
              required
              placeholder="Masalan: 6 нафар"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className='text-white'>Qurilgan yili *</label>
            <input
              type="text"
              name="buildYear"
              value={formData.buildYear || "2020"}
              onChange={handleChange}
              required
              placeholder="Masalan: 2001"
            />
          </div>
          <div className="form-group">
            <label className='text-white'>Oxirgi ta'mirlangan yil *</label>
            <input
              type="text"
              name="lastRepairYear"
              value={formData.lastRepairYear || "2023"}
              onChange={handleChange}
              required
              placeholder="Masalan: 2016"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className='text-white'>Binolar soni *</label>
            <input
              type="text"
              name="buildingCount"
              value={formData.buildingCount || "1"}
              onChange={handleChange}
              required
              placeholder="Masalan: 1"
            />
          </div>
          <div className="form-group">
            <label className='text-white'>Qavatligi *</label>
            <input
              type="text"
              name="floorCount"
              value={formData.floorCount || "1"}
              onChange={handleChange}
              required
              placeholder="Masalan: 1-қават"
            />
          </div>
          <div className="form-group">
            <label className='text-white'>Xonalar soni *</label>
            <input
              type="text"
              name="roomCount"
              value={formData.roomCount|| "9"}
              onChange={handleChange}
              required
              placeholder="Masalan: 5"
            />
          </div>
        </div>

        <div className="form-group">
          <label className='text-white'>Foydalanish maqsadi *</label>
          <select name="usagePurpose" value={formData.usagePurpose} onChange={handleChange} required>
            <option value="">Tanlang</option>
            <option value="Турар жой">🏠 Турар жой</option>
            <option value="Нотурар жой">🏭 Нотурар жой</option>
          </select>
        </div>
      </div>

      <button type="submit" className="btn-next ml-auto">Keyingi →</button>
    </form>
  );
}