import { useState } from 'react';
import { AuditData } from '../types/audit.types';
import { useTelegram } from '../hooks/useTelegram';

// const API_URL = import.meta.env.VITE_API_URL;

interface ReportProps {
  data: AuditData;
}

interface ArchRow { name: string; desc: string; area: string, value: string }
interface EngRow { type: string; desc: string; note: string }
interface DevRow {
  num: number; name: string; watt: number; count: number;
  totalKw: number; hours: number; dayKw: number; monthKw: number;
}

const DEFAULT_ARCH: ArchRow[] = [
  { name: "Umumiy ma'lumot (xona soni, qavatliligi, umumiy maydon)", value: "", desc: '10 xona, 1 qavatli', area: '565,22' },
  { name: 'Tashqi devorlar (material, qalinligi, izolyatsiya holati)', value: "", desc: `Pishgan g'isht 45 sm`, area: '766,23' },
  { name: "Er to'la (material, izolyatsiya turi va qalinligi)", value: "", desc: 'Beton plita', area: '154' },
  { name: 'Tom/shift (material, izolyatsiya turi va qalinligi)', value: "", desc: 'Beton plita, profnastil', area: '600,74' },
  { name: 'Pol (material, izolyatsiya turi va holati)', value: "", desc: 'Monolit beton', area: '489' },
  { name: 'Oynalar (rama turi, shisha soni)', value: "", desc: 'Plastik 2 qavatli shisha', area: '123,09' },
  { name: 'Tashqi eshiklar (material, izolyatsiya holati)', value: "", desc: 'Plastik eshiklar', area: '19,68' },
  { name: 'Isitilayotgan xonalar (umumiy maydon)', value: "", desc: '10 xonali 1 qavatli turar joy', area: '545' },
];

const DEFAULT_ENG: EngRow[] = [
  { type: 'Isitish tizimi', desc: '3 ta metall gaz, temir truba', note: '' },
  { type: "Issiq suv ta'minoti", desc: '2 kVt lik Royal elektir suv isitish', note: '' },
  { type: 'Sovitish tizimi', desc: '2 ta konditsaner, A sinf', note: '' },
  { type: 'Yoritish tizimi', desc: '44 ta LED lampa, (5 Vt dan 40 Vt gacha', note: '' },
  { type: 'Maishiy elektr uskunalari', desc: 'Muzlatgich 2 ta, 1 ta Televezor, kir moshina', note: '' },
  { type: "Suv ta'minoti", desc: `Markazlashgan suv tarmog'i`, note: '' },
  { type: 'Shamollatish', desc: 'Tabiy shamollatish', note: '' },
  { type: 'Elektr nasoslar', desc: '1 ta 0,55 kVt', note: '' },
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

  const showDebugInfo = () => {
    const debugDiv = document.getElementById('debug-log');
    if (!debugDiv) return;

    let logText = `=== DEBUG INFORMATION ===\n\n`;
    logText += `Vaqt: ${new Date().toLocaleString('uz-UZ')}\n`;
    logText += `Telegram User ID: ${tg?.initDataUnsafe?.user?.id || 'topilmadi'}\n`;
    logText += `Netlify URL: ${window.location.origin}\n\n`;

    logText += `=== So‘nggi fetch urinishlari ===\n`;

    // Sizning oldingi sendToChat dan log olish uchun global log array qo‘shish mumkin,
    // lekin hozircha oddiy tekshiruv:
    logText += `Fetch yo‘li: /.netlify/functions/send-report\n`;
    logText += `BOT_TOKEN mavjudligi: ${!!process.env.BOT_TOKEN ? 'Ha' : 'Yo‘q (Netlify env)'}\n\n`;

    debugDiv.textContent = logText;
    debugDiv.style.display = 'block';

    showAlert('Debug ma’lumotlar ko‘rsatildi. Pastdagi blokni ko‘ring va menga yuboring.');
  };
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

    if (!chatId) {
      showAlert('❌ Telegram orqali oching');
      return;
    }

    setIsGenerating(true);

    const debugDiv = document.getElementById('debug-log');
    if (debugDiv) debugDiv.style.display = 'none'; // eski logni tozalash

    try {
      console.log("🚀 Fetch boshlandi: /.netlify/functions/send-report");

      // const res = await fetch('/.netlify/functions/send-report', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     chatId,
      //     client: data.client,
      //     extra: { docNumber: docNumber || '001', formDate, auditDate },
      //     arch,
      //     eng,
      //     devs,
      //   }),
      // });

      const res = await fetch(
        'https://sun-energy-audit-app.netlify.app/.netlify/functions/send-report',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chatId, client: data.client, extra: { docNumber: docNumber || '001', formDate, auditDate }, arch, eng, devs }),
        }
      );
      console.log("📡 Response status:", res.status, res.statusText);

      let resultText = '';
      try {
        const text = await res.text();
        resultText = text;
        console.log("Server javobi (text):", text.substring(0, 500));

        const result = JSON.parse(text);
        console.log("Parsed JSON:", result);

        if (!res.ok || !result.ok) {
          throw new Error(result.error || `Server xatosi (${res.status})`);
        }

        hapticImpact('heavy');
        showAlert('✅ Word hujjat chatga yuborildi!');
      } catch (parseError) {
        console.error("JSON parse xatosi:", parseError);
        throw new Error(`Server javobi noto‘g‘ri formatda: ${resultText.substring(0, 200)}`);
      }

    } catch (e: any) {
      console.error("❌ To‘liq xato:", e);
      showAlert(`❌ Xatolik: ${e.message}`);

      // Debug div ga xatoni qo‘shish
      const debugDiv = document.getElementById('debug-log');
      if (debugDiv) {
        debugDiv.textContent = `XATO: ${e.message}\n\n${e.stack || ''}`;
        debugDiv.style.display = 'block';
      }
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
                placeholder={`masalan: ${row.desc}`} />
              <label style={lbl}>Maydoni / qiymati (m²)</label>
              <input style={inp} value={row.area}
                onChange={e => updateArch(i, 'area', e.target.value)}
                placeholder={`masalan: ${row.area}`} />
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
                placeholder={`masalan: ${row.desc}`} />
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

      <div style={{ marginTop: '20px', padding: '12px', background: '#f8f9fa', borderRadius: '12px', border: '1px solid #ddd' }}>
        <button
          onClick={showDebugInfo}
          style={{
            width: '100%',
            padding: '14px',
            background: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: 600,
            marginBottom: '10px',
            cursor: 'pointer'
          }}
        >
          🔍 Debug Log ko‘rish (Xatolikni aniqlash)
        </button>

        <div id="debug-log" style={{
          fontSize: '12px',
          background: '#fff',
          padding: '10px',
          borderRadius: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          display: 'none'
        }}></div>
      </div>
    </div>
  );
}