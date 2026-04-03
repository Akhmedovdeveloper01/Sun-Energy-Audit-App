import { useState } from 'react';
import { AuditData } from '../types/audit.types';
import { useTelegram } from '../hooks/useTelegram';

// .env ga qo'ying: VITE_API_URL=https://audit-api-xxxx.vercel.app
const API_URL = import.meta.env.VITE_API_URL;

interface ReportProps {
  data: AuditData;
}

interface ArchRow { name: string; desc: string; area: string }
interface EngRow { type: string; desc: string; note: string }
interface DevRow {
  num: number; name: string; watt: number; count: number;
  totalKw: number; hours: number; dayKw: number; monthKw: number;
}

const DEFAULT_ARCH: ArchRow[] = [
  { name: "Umumiy ma'lumot (xona soni, qavatliligi, umumiy maydon)", desc: '', area: '' },
  { name: 'Tashqi devorlar (material, qalinligi, izolyatsiya holati)', desc: '', area: '' },
  { name: "Er to'la (material, izolyatsiya turi va qalinligi)", desc: '', area: '' },
  { name: 'Tom/shift (material, izolyatsiya turi va qalinligi)', desc: '', area: '' },
  { name: 'Pol (material, izolyatsiya turi va holati)', desc: '', area: '' },
  { name: 'Oynalar (rama turi, shisha soni)', desc: '', area: '' },
  { name: 'Tashqi eshiklar (material, izolyatsiya holati)', desc: '', area: '' },
  { name: 'Isitilayotgan xonalar (umumiy maydon)', desc: '', area: '' },
];

const DEFAULT_ENG: EngRow[] = [
  { type: 'Isitish tizimi', desc: '', note: '' },
  { type: "Issiq suv ta'minoti", desc: '', note: '' },
  { type: 'Sovitish tizimi', desc: '', note: '' },
  { type: 'Yoritish tizimi', desc: '', note: '' },
  { type: 'Maishiy elektr uskunalari', desc: '', note: '' },
  { type: "Suv ta'minoti", desc: '', note: '' },
  { type: 'Shamollatish', desc: '', note: '' },
  { type: 'Elektr nasoslar', desc: '', note: '' },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const inp: React.CSSProperties = {
  width: '100%', padding: '8px 10px', borderRadius: '8px',
  border: '1px solid #ccc', fontSize: '14px', boxSizing: 'border-box',
};
const sec: React.CSSProperties = {
  background: '#f9f9f9', borderRadius: '12px', padding: '14px', marginBottom: '14px',
};
const lbl: React.CSSProperties = {
  fontSize: '12px', color: '#555', marginBottom: '4px', display: 'block',
};

export default function Report({ data }: ReportProps) {
  const { showAlert, hapticImpact, tg } = useTelegram();
  const [isGenerating, setIsGenerating] = useState(false);
  const [tab, setTab] = useState<'summary' | 'arch' | 'eng' | 'dev' | 'doc'>('summary');

  const [docNumber, setDocNumber] = useState('');
  const [formDate, setFormDate] = useState(new Date().toLocaleDateString('uz-UZ'));
  const [auditDate, setAuditDate] = useState(new Date().toLocaleDateString('uz-UZ'));
  const [arch, setArch] = useState<ArchRow[]>(DEFAULT_ARCH);
  const [eng, setEng] = useState<EngRow[]>(DEFAULT_ENG);
  const [devs, setDevs] = useState<DevRow[]>([
    { num: 1, name: '', watt: 0, count: 1, totalKw: 0, hours: 0, dayKw: 0, monthKw: 0 },
  ]);

  const updateArch = (i: number, k: keyof ArchRow, v: string) =>
    setArch(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const updateEng = (i: number, k: keyof EngRow, v: string) =>
    setEng(p => p.map((r, idx) => idx === i ? { ...r, [k]: v } : r));

  const updateDevName = (i: number, v: string) =>
    setDevs(p => p.map((r, idx) => idx === i ? { ...r, name: v } : r));

  const updateDev = (i: number, k: keyof DevRow, v: string) => {
    setDevs(p => p.map((r, idx) => {
      if (idx !== i) return r;
      const n = { ...r, [k]: parseFloat(v) || 0 };
      n.totalKw = parseFloat((n.watt * n.count / 1000).toFixed(3));
      n.dayKw = parseFloat((n.totalKw * n.hours).toFixed(2));
      n.monthKw = parseFloat((n.dayKw * 31).toFixed(2));
      return n;
    }));
  };

  const addDev = () => setDevs(p => [
    ...p,
    { num: p.length + 1, name: '', watt: 0, count: 1, totalKw: 0, hours: 0, dayKw: 0, monthKw: 0 },
  ]);

  const removeDev = (i: number) =>
    setDevs(p => p.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, num: idx + 1 })));

  const sendToChat = async () => {
    const chatId = tg?.initDataUnsafe?.user?.id;

    // Debug: nima yuborilayotganini ko'rish
    console.log('API_URL:', API_URL);
    console.log('chatId:', chatId);

    if (!chatId) { showAlert('❌ Telegram orqali oching'); return; }
    if (!chatId) { showAlert('❌ Telegram orqali oching'); return; }

    setIsGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/send-report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          client: data.client,
          extra: { docNumber: docNumber || '001', formDate, auditDate },
          arch,
          eng,
          devs,
        }),
      });


      const result = await res.json();
      if (!result.ok) throw new Error(result.error || 'Server xatolik');

      hapticImpact('heavy');
      showAlert('✅ Word hujjat chatga yuborildi!');
    } catch (e: any) {
      showAlert(`❌ Xatolik: ${e.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const totalMonthly = devs.reduce((s, d) => s + d.monthKw, 0).toFixed(2);

  const tabs = [
    { id: 'summary', label: '📊 Xulosa' },
    { id: 'arch', label: '🏗 Arxitektura' },
    { id: 'eng', label: '⚙️ Muhandislik' },
    { id: 'dev', label: '💡 Qurilmalar' },
    { id: 'doc', label: '📄 Hujjat' },
  ] as const;

  return (
    <div style={{ padding: '12px', fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 10px', borderRadius: '10px', border: 'none',
            cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap',
            fontWeight: tab === t.id ? 700 : 400,
            background: tab === t.id ? '#667eea' : '#f0f0f0',
            color: tab === t.id ? 'white' : '#333',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Xulosa ── */}
      {tab === 'summary' && <>
        <div style={sec}>
          <h3 style={{ margin: '0 0 10px' }}>👤 Mijoz</h3>
          <p style={{ margin: '4px 0' }}><strong>Ism:</strong> {data.client.fullName}</p>
          <p style={{ margin: '4px 0' }}><strong>Telefon:</strong> {data.client.phone}</p>
          <p style={{ margin: '4px 0' }}><strong>Manzil:</strong> {data.client.address}</p>
        </div>
        <p style={{ fontSize: '13px', color: '#888', textAlign: 'center' }}>
          Qolgan tablarni to'ldiring → "Hujjat" tabidan chatga yuboring
        </p>
      </>}

      {/* ── Arxitektura ── */}
      {tab === 'arch' && (
        <div style={sec}>
          <h3 style={{ margin: '0 0 14px' }}>🏗 2.1. Arxitektura va konstruktsiya</h3>
          {arch.map((row, i) => (
            <div key={i} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #eee' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600, color: '#333' }}>{row.name}</p>
              <label style={lbl}>Tavsif (material, turi)</label>
              <input style={{ ...inp, marginBottom: '6px' }} value={row.desc}
                onChange={e => updateArch(i, 'desc', e.target.value)}
                placeholder="masalan: pishgan g'isht, 40 sm..." />
              <label style={lbl}>Maydoni / qiymati (m²)</label>
              <input style={inp} value={row.area}
                onChange={e => updateArch(i, 'area', e.target.value)}
                placeholder="masalan: 565,22" />
            </div>
          ))}
        </div>
      )}

      {/* ── Muhandislik ── */}
      {tab === 'eng' && (
        <div style={sec}>
          <h3 style={{ margin: '0 0 14px' }}>⚙️ 2.2. Muhandislik tizimlari</h3>
          {eng.map((row, i) => (
            <div key={i} style={{ marginBottom: '14px', paddingBottom: '14px', borderBottom: '1px solid #eee' }}>
              <p style={{ margin: '0 0 8px', fontSize: '13px', fontWeight: 600 }}>{row.type}</p>
              <label style={lbl}>Tavsif (qurilma, marka, quvvati)</label>
              <input style={{ ...inp, marginBottom: '6px' }} value={row.desc}
                onChange={e => updateEng(i, 'desc', e.target.value)}
                placeholder="masalan: 2 kVt Royal suv isitgich" />
              <label style={lbl}>Izoh (ixtiyoriy)</label>
              <input style={inp} value={row.note}
                onChange={e => updateEng(i, 'note', e.target.value)}
                placeholder="—" />
            </div>
          ))}
        </div>
      )}

      {/* ── Qurilmalar ── */}
      {tab === 'dev' && (
        <div style={sec}>
          <h3 style={{ margin: '0 0 14px' }}>💡 2.3. Elektr qurilmalar</h3>
          {devs.map((row, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '10px', padding: '12px',
              marginBottom: '10px', border: '1px solid #e0e0e0',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px' }}>#{row.num}</strong>
                <button onClick={() => removeDev(i)} style={{
                  padding: '4px 10px', background: '#ffebee', border: '1px solid #ef9a9a',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#c62828',
                }}>✕ O'chirish</button>
              </div>
              <label style={lbl}>Qurilma nomi</label>
              <input style={{ ...inp, marginBottom: '8px' }} value={row.name}
                onChange={e => updateDevName(i, e.target.value)}
                placeholder="masalan: Muzlatgich" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={lbl}>Quvvati (Vt)</label>
                  <input type="number" style={inp} value={row.watt || ''}
                    onChange={e => updateDev(i, 'watt', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>Soni (dona)</label>
                  <input type="number" style={inp} value={row.count || ''}
                    onChange={e => updateDev(i, 'count', e.target.value)} placeholder="1" />
                </div>
                <div>
                  <label style={lbl}>Ishlash vaqti (soat/kun)</label>
                  <input type="number" style={inp} value={row.hours || ''}
                    onChange={e => updateDev(i, 'hours', e.target.value)} placeholder="0" />
                </div>
                <div>
                  <label style={lbl}>Umumiy quvvat (kVt)</label>
                  <input style={{ ...inp, background: '#f5f5f5', color: '#666' }}
                    value={row.totalKw} readOnly />
                </div>
              </div>
              <div style={{
                marginTop: '8px', padding: '8px', background: '#e8f5e9',
                borderRadius: '6px', fontSize: '12px', color: '#2e7d32',
              }}>
                Kunlik: <strong>{row.dayKw} kVt*soat</strong> &nbsp;|&nbsp; Oylik: <strong>{row.monthKw} kVt*soat</strong>
              </div>
            </div>
          ))}
          <button onClick={addDev} style={{
            padding: '8px 16px', background: '#e8f5e9', border: '1px solid #a5d6a7',
            borderRadius: '8px', cursor: 'pointer', fontSize: '13px', color: '#2e7d32',
          }}>
            + Qurilma qo'shish
          </button>
          <div style={{
            marginTop: '12px', padding: '10px', background: '#fff3e0',
            borderRadius: '8px', fontSize: '14px',
          }}>
            <strong>Jami oylik iste'mol: {totalMonthly} kVt*soat</strong>
          </div>
        </div>
      )}

      {/* ── Hujjat ── */}
      {tab === 'doc' && (
        <div style={sec}>
          <h3 style={{ margin: '0 0 14px' }}>📄 Hujjat ma'lumotlari</h3>

          <label style={lbl}>Hujjat raqami</label>
          <input style={{ ...inp, marginBottom: '10px' }} value={docNumber}
            onChange={e => setDocNumber(e.target.value)} placeholder="masalan: 020" />

          <label style={lbl}>Shakllantirirlgan sana</label>
          <input style={{ ...inp, marginBottom: '10px' }} value={formDate}
            onChange={e => setFormDate(e.target.value)} placeholder="KK.OO.YYYY" />

          <label style={lbl}>Audit sanasi</label>
          <input style={{ ...inp, marginBottom: '20px' }} value={auditDate}
            onChange={e => setAuditDate(e.target.value)} placeholder="KK.OO.YYYY" />

          <button onClick={sendToChat} disabled={isGenerating} style={{
            width: '100%', padding: '16px',
            background: isGenerating ? '#aaa' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', borderRadius: '16px',
            fontSize: '16px', fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
          }}>
            {isGenerating ? '⏳ Hujjat yaratilmoqda...' : '📨 Word hujjatni chatga yuborish'}
          </button>

          <p style={{ marginTop: '10px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
            Server .docx yaratadi va Telegram chatga yuboradi
          </p>
        </div>
      )}
    </div>
  );
}