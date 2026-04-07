import { useState, useRef } from 'react';
import { AuditData } from '../types/audit.types';
import { useTelegram } from '../hooks/useTelegram';

interface ReportProps {
  data: AuditData;
}

interface ArchRow { name: string; desc: string; area: string; value: string }
interface EngRow { type: string; desc: string; note: string }
interface DevRow {
  num: number; name: string; watt: number; count: number;
  totalKw: number; hours: number; dayKw: number; monthKw: number;
  photos: { file: File; preview: string }[];
}

const DEFAULT_ARCH: ArchRow[] = [
  { name: "Umumiy ma'lumot (xona soni, qavatliligi, umumiy maydon)", value: "", desc: '10 xona, 1 qavatli', area: '565,22' },
  { name: 'Tashqi devorlar (material, qalinligi, izolyatsiya holati)', value: "", desc: "Pishgan g'isht 45 sm", area: '766,23' },
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
  { type: "Suv ta'minoti", desc: "Markazlashgan suv tarmog'i", note: '' },
  { type: 'Shamollatish', desc: 'Tabiy shamollatish', note: '' },
  { type: 'Elektr nasoslar', desc: '1 ta 0,55 kVt', note: '' },
];

const newDev = (num: number): DevRow => ({
  num, name: '', watt: 0, count: 1,
  totalKw: 0, hours: 0, dayKw: 0, monthKw: 0,
  photos: [],
});

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
  const [devs, setDevs] = useState<DevRow[]>([newDev(1)]);

  // Umumiy rasmlar (Hujjat tabida)
  const [generalPhotos, setGeneralPhotos] = useState<{ file: File; preview: string }[]>([]);
  const generalFileRef = useRef<HTMLInputElement>(null);

  // Qurilma rasmlari uchun ref (har bir qurilma uchun)
  const devFileRefs = useRef<(HTMLInputElement | null)[]>([]);

  // ─── Umumiy rasmlar ───────────────────────────────────────────────────────
  const handleGeneralPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const added = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setGeneralPhotos(prev => [...prev, ...added].slice(0, 10));
    e.target.value = '';
  };

  const removeGeneralPhoto = (i: number) => {
    setGeneralPhotos(prev => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  // ─── Qurilma rasmlari ─────────────────────────────────────────────────────
  const handleDevPhoto = (devIdx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const added = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setDevs(prev => prev.map((d, i) => i === devIdx
      ? { ...d, photos: [...d.photos, ...added].slice(0, 5) }
      : d
    ));
    e.target.value = '';
  };

  const removeDevPhoto = (devIdx: number, photoIdx: number) => {
    setDevs(prev => prev.map((d, i) => {
      if (i !== devIdx) return d;
      URL.revokeObjectURL(d.photos[photoIdx].preview);
      return { ...d, photos: d.photos.filter((_, pi) => pi !== photoIdx) };
    }));
  };

  const openDevCamera = (devIdx: number) => {
    const ref = devFileRefs.current[devIdx];
    if (ref) { ref.setAttribute('capture', 'environment'); ref.click(); }
  };

  const openDevGallery = (devIdx: number) => {
    const ref = devFileRefs.current[devIdx];
    if (ref) { ref.removeAttribute('capture'); ref.click(); }
  };

  // ─── Boshqa update funksiyalar ────────────────────────────────────────────
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

  const addDev = () => setDevs(p => [...p, newDev(p.length + 1)]);

  const removeDev = (i: number) =>
    setDevs(p => p.filter((_, idx) => idx !== i).map((r, idx) => ({ ...r, num: idx + 1 })));

  // ─── base64 ───────────────────────────────────────────────────────────────
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve((e.target?.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // ─── Yuborish ─────────────────────────────────────────────────────────────
  const sendToChat = async () => {
    const chatId = tg?.initDataUnsafe?.user?.id;
    if (!chatId) { showAlert('❌ Telegram orqali oching'); return; }

    setIsGenerating(true);
    try {
      // Umumiy rasmlar
      const generalPhotosB64 = await Promise.all(
        generalPhotos.map(async p => ({
          base64: await fileToBase64(p.file),
          mime: p.file.type,
          name: p.file.name,
        }))
      );

      // Qurilmalar (rasmlar bilan)
      const devsWithPhotos = await Promise.all(
        devs.map(async d => ({
          num: d.num,
          name: d.name,
          watt: d.watt,
          count: d.count,
          totalKw: d.totalKw,
          hours: d.hours,
          dayKw: d.dayKw,
          monthKw: d.monthKw,
          photos: await Promise.all(
            d.photos.map(async p => ({
              base64: await fileToBase64(p.file),
              mime: p.file.type,
              name: p.file.name,
            }))
          ),
        }))
      );

      const res = await fetch('https://sunenergyaudit.vercel.app/api/send-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
          client: data.client,
          extra: { docNumber: docNumber || '001', formDate, auditDate },
          arch, eng,
          devs: devsWithPhotos,
          photos: generalPhotosB64,
        }),
      });

      const result = JSON.parse(await res.text());
      if (!res.ok || !result.ok) throw new Error(result.error || `Server xatosi (${res.status})`);

      const totalPhotos = generalPhotosB64.length + devsWithPhotos.reduce((s, d) => s + d.photos.length, 0);
      hapticImpact('heavy');
      showAlert(`✅ Hujjat${totalPhotos > 0 ? ` va ${totalPhotos} ta rasm` : ''} chatga yuborildi!`);
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

  // ─── Mini rasm qo'shish bloki ─────────────────────────────────────────────
  const DevPhotoBlock = ({ devIdx, dev }: { devIdx: number; dev: DevRow }) => (
    <div style={{ marginBottom: '10px' }}>
      {/* Preview */}
      {dev.photos.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
          {dev.photos.map((p, pi) => (
            <div key={pi} style={{ position: 'relative', width: '64px', height: '64px' }}>
              <img src={p.preview} alt="" style={{
                width: '64px', height: '64px', objectFit: 'cover',
                borderRadius: '8px', border: '1px solid #e0e0e0', display: 'block',
              }} />
              <button onClick={() => removeDevPhoto(devIdx, pi)} style={{
                position: 'absolute', top: '2px', right: '2px',
                width: '18px', height: '18px',
                background: 'rgba(0,0,0,0.65)', color: 'white',
                border: 'none', borderRadius: '50%', cursor: 'pointer',
                fontSize: '10px', lineHeight: 1, padding: 0,
              }}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Tugmalar */}
      {dev.photos.length < 5 && (
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={() => openDevCamera(devIdx)} style={{
            flex: 1, padding: '7px 4px',
            background: '#e3f2fd', border: '1px solid #90caf9',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', color: '#1565c0', fontWeight: 600,
          }}>
            📷 Kamera
          </button>
          <button onClick={() => openDevGallery(devIdx)} style={{
            flex: 1, padding: '7px 4px',
            background: '#f3e5f5', border: '1px solid #ce93d8',
            borderRadius: '8px', cursor: 'pointer',
            fontSize: '12px', color: '#6a1b9a', fontWeight: 600,
          }}>
            🖼 Galereya
          </button>
          {dev.photos.length > 0 && (
            <span style={{ fontSize: '11px', color: '#999', alignSelf: 'center', whiteSpace: 'nowrap' }}>
              {dev.photos.length}/5
            </span>
          )}
        </div>
      )}

      <input
        ref={el => { devFileRefs.current[devIdx] = el; }}
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        onChange={e => handleDevPhoto(devIdx, e)}
      />
    </div>
  );

  return (
    <div style={{ padding: '12px', fontFamily: 'sans-serif', maxWidth: 480, margin: '0 auto' }}>

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

      {/* Xulosa */}
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

      {/* Arxitektura */}
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

      {/* Muhandislik */}
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

      {/* Qurilmalar */}
      {tab === 'dev' && (
        <div style={sec}>
          <h3 style={{ margin: '0 0 14px' }}>💡 2.3. Elektr qurilmalar</h3>
          {devs.map((row, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '10px', padding: '12px',
              marginBottom: '10px', border: '1px solid #e0e0e0',
            }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <strong style={{ fontSize: '13px' }}>#{row.num}</strong>
                <button onClick={() => removeDev(i)} style={{
                  padding: '4px 10px', background: '#ffebee', border: '1px solid #ef9a9a',
                  borderRadius: '6px', cursor: 'pointer', fontSize: '12px', color: '#c62828',
                }}>✕ O'chirish</button>
              </div>

              {/* ── Qurilma rasmlari (nomdan tepada) ── */}
              <div style={{
                marginBottom: '10px', padding: '10px',
                background: '#fafafa', borderRadius: '8px',
                border: '1px dashed #ccc',
              }}>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '6px', fontWeight: 600 }}>
                  📸 Qurilma rasmlari ({row.photos.length}/5)
                </div>
                <DevPhotoBlock devIdx={i} dev={row} />
              </div>

              {/* Qurilma nomi */}
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
          <div style={{ marginTop: '12px', padding: '10px', background: '#fff3e0', borderRadius: '8px', fontSize: '14px' }}>
            <strong>Jami oylik iste'mol: {totalMonthly} kVt*soat</strong>
          </div>
        </div>
      )}

      {/* Hujjat */}
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
          <input style={{ ...inp, marginBottom: '16px' }} value={auditDate}
            onChange={e => setAuditDate(e.target.value)} placeholder="KK.OO.YYYY" />

          {/* Umumiy rasmlar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '10px', color: '#333' }}>
              📸 Umumiy ob'ekt rasmlari ({generalPhotos.length}/10)
            </div>

            {generalPhotos.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '10px' }}>
                {generalPhotos.map((p, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={p.preview} alt="" style={{
                      width: '100%', aspectRatio: '1', objectFit: 'cover',
                      borderRadius: '8px', border: '1px solid #e0e0e0', display: 'block',
                    }} />
                    <button onClick={() => removeGeneralPhoto(i)} style={{
                      position: 'absolute', top: '4px', right: '4px',
                      width: '22px', height: '22px',
                      background: 'rgba(0,0,0,0.65)', color: 'white',
                      border: 'none', borderRadius: '50%', cursor: 'pointer',
                      fontSize: '11px', lineHeight: 1,
                    }}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {generalPhotos.length < 10 && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <button onClick={() => {
                  if (generalFileRef.current) {
                    generalFileRef.current.setAttribute('capture', 'environment');
                    generalFileRef.current.click();
                  }
                }} style={{
                  padding: '12px 8px', background: '#e3f2fd', border: '1px solid #90caf9',
                  borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                  color: '#1565c0', fontWeight: 600,
                }}>📷 Kamera</button>
                <button onClick={() => {
                  if (generalFileRef.current) {
                    generalFileRef.current.removeAttribute('capture');
                    generalFileRef.current.click();
                  }
                }} style={{
                  padding: '12px 8px', background: '#f3e5f5', border: '1px solid #ce93d8',
                  borderRadius: '10px', cursor: 'pointer', fontSize: '14px',
                  color: '#6a1b9a', fontWeight: 600,
                }}>🖼 Galereya</button>
              </div>
            )}

            <input ref={generalFileRef} type="file" accept="image/*" multiple
              style={{ display: 'none' }} onChange={handleGeneralPhoto} />
          </div>

          <button onClick={sendToChat} disabled={isGenerating} style={{
            width: '100%', padding: '16px',
            background: isGenerating ? '#aaa' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white', border: 'none', borderRadius: '16px',
            fontSize: '16px', fontWeight: 700,
            cursor: isGenerating ? 'not-allowed' : 'pointer',
          }}>
            {isGenerating ? '⏳ Yuborilmoqda...' : '📨 Hujjat va rasmlarni yuborish'}
          </button>

          <p style={{ marginTop: '10px', fontSize: '12px', color: '#888', textAlign: 'center' }}>
            Server .docx yaratadi, rasmlar bilan chatga yuboradi
          </p>
        </div>
      )}
    </div>
  );
}