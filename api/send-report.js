// // @vercel/node
// import {
//     Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
//     AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
//   } from 'docx';
  
//   const BOT_TOKEN = process.env.BOT_TOKEN;
  
//   const W = 9360;
//   const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
//   const borders = { top: border, bottom: border, left: border, right: border };
  
//   function cell(text, opts = {}) {
//     const {
//       width = 2000, bold = false, shade = 'FFFFFF',
//       align = AlignmentType.LEFT, size = 20, colSpan, italics = false,
//     } = opts;
//     return new TableCell({
//       borders,
//       columnSpan: colSpan,
//       verticalAlign: VerticalAlign.CENTER,
//       width: { size: width, type: WidthType.DXA },
//       shading: { fill: shade, type: ShadingType.CLEAR },
//       margins: { top: 60, bottom: 60, left: 100, right: 100 },
//       children: [new Paragraph({
//         alignment: align,
//         children: [new TextRun({ text: String(text ?? ''), bold, size, font: 'Times New Roman', italics })],
//       })],
//     });
//   }
  
//   function heading(text, sz = 24) {
//     return new Paragraph({
//       alignment: AlignmentType.CENTER,
//       spacing: { before: 140, after: 80 },
//       children: [new TextRun({ text, bold: true, size: sz, font: 'Times New Roman' })],
//     });
//   }
  
//   function boldLabel(text) {
//     return new Paragraph({
//       spacing: { before: 80, after: 60 },
//       children: [new TextRun({ text, bold: true, size: 20, font: 'Times New Roman' })],
//     });
//   }
  
//   function spacer() {
//     return new Paragraph({ children: [new TextRun('')], spacing: { before: 60, after: 60 } });
//   }
  
//   async function buildDocx({ client, extra, arch, eng, devs }) {
//     const GRAY = 'D9D9D9';
  
//     function headerTable() {
//       return new Table({
//         width: { size: W, type: WidthType.DXA },
//         columnWidths: [5400, 3960],
//         rows: [
//           new TableRow({ children: [
//             cell('Energiya auditorlik xulosasi shakllantirirlgan sana', { width: 5400, bold: true }),
//             cell(extra.formDate, { width: 3960, align: AlignmentType.CENTER }),
//           ]}),
//           new TableRow({ children: [
//             new TableCell({
//               borders, rowSpan: 2,
//               width: { size: 5400, type: WidthType.DXA },
//               shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
//               margins: { top: 60, bottom: 60, left: 100, right: 100 },
//               children: [new Paragraph({
//                 children: [new TextRun({
//                   text: 'Energiya auditorlik xulosasi berilgan',
//                   bold: true, size: 20, font: 'Times New Roman',
//                 })],
//               })],
//             }),
//             cell('Sana', { width: 3960, bold: true }),
//           ]}),
//           new TableRow({ children: [
//             cell(extra.auditDate, { width: 3960, align: AlignmentType.CENTER }),
//           ]}),
//           new TableRow({ children: [
//             cell('Raqami', { width: 5400, bold: true }),
//             cell(`№ ${extra.docNumber}`, { width: 3960, align: AlignmentType.CENTER }),
//           ]}),
//         ],
//       });
//     }
  
//     function generalTable() {
//       const rows = [
//         ["Ob'ekt joylashgan manzili", client.address || ''],
//         ['Xonadon egasi', client.fullName || ''],
//         ["Ob'ektdan foydalanuvchilar soni", `${client.residentsCount || ''} nafar`],
//         ["Qurilgan yili / Oxirgi ta'mirlangan yil", `${client.buildYear || ''} / ${client.lastRepairYear || ''}`],
//         ['Binolar soni / Qavatliligi / Xonalar soni', `${client.buildingCount || ''} / ${client.floorCount || ''} qavat / ${client.roomCount || ''}`],
//         ['Foydalanish maqsadi', client.usagePurpose || ''],
//       ];
//       return new Table({
//         width: { size: W, type: WidthType.DXA },
//         columnWidths: [4200, 5160],
//         rows: rows.map(([l, v]) => new TableRow({ children: [
//           cell(l, { width: 4200, bold: true }),
//           cell(v, { width: 5160 }),
//         ]})),
//       });
//     }
  
//     function archTable() {
//       const colW = [3960, 3960, 1440];
//       return new Table({
//         width: { size: W, type: WidthType.DXA },
//         columnWidths: colW,
//         rows: [
//           new TableRow({ tableHeader: true, children: [
//             cell("Ko'rsatkich", { width: colW[0], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Tavsif (material, turi)', { width: colW[1], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Maydoni / qiymati (m²)', { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//           ]}),
//           ...(arch || []).map(r => new TableRow({ children: [
//             cell(r.name || '', { width: colW[0] }),
//             cell(r.desc || '', { width: colW[1] }),
//             cell(r.area || '', { width: colW[2], align: AlignmentType.CENTER }),
//           ]})),
//         ],
//       });
//     }
  
//     function engTable() {
//       const colW = [2200, 4160, 3000];
//       const total = (devs || []).reduce((s, d) => s + (d.monthKw || 0), 0).toFixed(2);
//       return new Table({
//         width: { size: W, type: WidthType.DXA },
//         columnWidths: colW,
//         rows: [
//           new TableRow({ tableHeader: true, children: [
//             cell('Tizim turi', { width: colW[0], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Tavsif (qurilma, marka, quvvati)', { width: colW[1], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Izoh', { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//           ]}),
//           ...(eng || []).map(r => new TableRow({ children: [
//             cell(r.type || '', { width: colW[0] }),
//             cell(r.desc || '', { width: colW[1] }),
//             cell(r.note || '—', { width: colW[2] }),
//           ]})),
//           new TableRow({ children: [
//             new TableCell({
//               borders, columnSpan: 2,
//               width: { size: colW[0] + colW[1], type: WidthType.DXA },
//               shading: { fill: GRAY, type: ShadingType.CLEAR },
//               margins: { top: 60, bottom: 60, left: 100, right: 100 },
//               children: [new Paragraph({
//                 alignment: AlignmentType.RIGHT,
//                 children: [new TextRun({ text: "Jami iste'mol:", bold: true, size: 20, font: 'Times New Roman' })],
//               })],
//             }),
//             cell(`${total} kVt*soat/oy`, { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//           ]}),
//         ],
//       });
//     }
  
//     function devTable() {
//       const colW = [400, 2300, 600, 500, 700, 700, 730, 830];
//       return new Table({
//         width: { size: W, type: WidthType.DXA },
//         columnWidths: colW,
//         rows: [
//           new TableRow({ tableHeader: true, children: [
//             cell('№', { width: colW[0], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Qurilma nomi', { width: colW[1], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Quvvati Vt', { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Soni dona', { width: colW[3], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Umumiy quvvati kVt', { width: colW[4], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell('Ishlash vaqti soat', { width: colW[5], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell("EE iste'moli sut kVt*soat", { width: colW[6], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell("EE iste'moli oy kVt*soat", { width: colW[7], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//           ]}),
//           ...(devs || []).map(r => new TableRow({ children: [
//             cell(r.num || '', { width: colW[0], align: AlignmentType.CENTER }),
//             cell(r.name || '', { width: colW[1] }),
//             cell(r.watt || 0, { width: colW[2], align: AlignmentType.CENTER }),
//             cell(r.count || 0, { width: colW[3], align: AlignmentType.CENTER }),
//             cell(r.totalKw || 0, { width: colW[4], align: AlignmentType.CENTER }),
//             cell(r.hours || 0, { width: colW[5], align: AlignmentType.CENTER }),
//             cell(r.dayKw || 0, { width: colW[6], align: AlignmentType.CENTER }),
//             cell(r.monthKw || 0, { width: colW[7], align: AlignmentType.CENTER }),
//           ]})),
//           new TableRow({ children: [
//             new TableCell({
//               borders, columnSpan: 6,
//               width: { size: colW.slice(0, 6).reduce((a, b) => a + b, 0), type: WidthType.DXA },
//               shading: { fill: GRAY, type: ShadingType.CLEAR },
//               margins: { top: 60, bottom: 60, left: 100, right: 100 },
//               children: [new Paragraph({
//                 alignment: AlignmentType.RIGHT,
//                 children: [new TextRun({ text: 'Umumiysi:', bold: true, size: 20, font: 'Times New Roman' })],
//               })],
//             }),
//             cell((devs || []).reduce((s, d) => s + (d.dayKw || 0), 0).toFixed(2), { width: colW[6], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//             cell((devs || []).reduce((s, d) => s + (d.monthKw || 0), 0).toFixed(2), { width: colW[7], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
//           ]}),
//         ],
//       });
//     }
  
//     const doc = new Document({
//       sections: [{
//         properties: {
//           page: {
//             size: { width: 11906, height: 16838 },
//             margin: { top: 1134, right: 850, bottom: 1134, left: 1134 },
//           },
//         },
//         children: [
//           new Paragraph({
//             alignment: AlignmentType.CENTER,
//             spacing: { before: 0, after: 60 },
//             children: [new TextRun({ text: 'ENERGIYA AUDIT XULOSASI', bold: true, size: 32, font: 'Times New Roman' })],
//           }),
//           new Paragraph({
//             alignment: AlignmentType.CENTER,
//             spacing: { before: 0, after: 200 },
//             children: [new TextRun({ text: '(Aholi uy-joylari uchun)', size: 22, font: 'Times New Roman', italics: true })],
//           }),
//           headerTable(),
//           spacer(),
//           boldLabel("I. Umumiy ma'lumot"),
//           generalTable(),
//           spacer(),
//           heading('II. Uy-joy tavsifi'),
//           heading('2.1. Arxitektura va konstruktsiya xususiyatlari', 22),
//           spacer(),
//           archTable(),
//           spacer(),
//           heading('2.2. Muhandislik tizimlari', 22),
//           spacer(),
//           engTable(),
//           spacer(),
//           heading("2.3. Asosiy elektr qurilmalari tarkibi va ularning ko'rsatgichlari", 22),
//           spacer(),
//           devTable(),
//           spacer(),
//           new Paragraph({
//             spacing: { before: 60, after: 60 },
//             children: [new TextRun({
//               text: "Izoh: O'rtacha oylik EE iste'moliga mos keladigan ko'rsatgichlar",
//               size: 18, font: 'Times New Roman', italics: true,
//             })],
//           }),
//         ],
//       }],
//     });
  
//     return Packer.toBuffer(doc);
//   }
  
//   // ─── Vercel Handler ───────────────────────────────────────────────────────────
//   export default async function handler(req, res) {
//     res.setHeader('Access-Control-Allow-Origin', '*');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//     res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  
//     if (req.method === 'OPTIONS') return res.status(200).end();
//     if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
//     try {
//       const { chatId, client, extra, arch, eng, devs } = req.body;
  
//       if (!BOT_TOKEN) throw new Error("BOT_TOKEN Vercel Environment Variables ga qo'shilmagan");
//       if (!chatId) throw new Error('chatId topilmadi');
  
//       const buffer = await buildDocx({ client, extra, arch, eng, devs });
  
//       const filename = `audit_${(client?.fullName || 'report').replace(/\s+/g, '_')}_${Date.now()}.docx`;
//       const caption = `📋 Energiya Audit Xulosasi\n👤 ${client?.fullName}\n📍 ${client?.address}\n📅 ${extra?.auditDate}\n🔢 №${extra?.docNumber}`;
  
//       const formData = new FormData();
//       formData.append('chat_id', String(chatId));
//       formData.append('document', new Blob([buffer], {
//         type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       }), filename);
//       formData.append('caption', caption);
  
//       const tgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
//         method: 'POST',
//         body: formData,
//       });
  
//       const tgData = await tgRes.json();
//       if (!tgData.ok) throw new Error(tgData.description || 'Telegram xatolik');
  
//       return res.status(200).json({ ok: true });
  
//     } catch (e) {
//       console.error('XATO:', e.message);
//       return res.status(500).json({ ok: false, error: e.message });
//     }
//   }

// @vercel/node
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
} from 'docx';

const BOT_TOKEN = process.env.BOT_TOKEN;
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;
const W = 9638;
const border = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const borders = { top: border, bottom: border, left: border, right: border };

function cell(text, opts = {}) {
  const { width = 2000, bold = false, shade = 'FFFFFF', align = AlignmentType.LEFT, size = 20, colSpan, italics = false } = opts;
  return new TableCell({
    borders, columnSpan: colSpan, verticalAlign: VerticalAlign.CENTER,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text ?? ''), bold, size, font: 'Times New Roman', italics })],
    })],
  });
}

function heading(text, sz = 24) {
  return new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { before: 140, after: 80 },
    children: [new TextRun({ text, bold: true, size: sz, font: 'Times New Roman' })],
  });
}

function boldLabel(text) {
  return new Paragraph({
    spacing: { before: 80, after: 60 },
    children: [new TextRun({ text, bold: true, size: 20, font: 'Times New Roman' })],
  });
}

function spacer() {
  return new Paragraph({ children: [new TextRun('')], spacing: { before: 60, after: 60 } });
}

async function buildDocx({ client, extra, arch, eng, devs }) {
  const GRAY = 'D9D9D9';

  function headerTable() {
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [5638, 4000],
      rows: [
        new TableRow({ children: [
          cell('Energiya auditorlik xulosasi shakllantirirlgan sana', { width: 5638, bold: true }),
          cell(extra.formDate, { width: 4000, align: AlignmentType.CENTER }),
        ]}),
        new TableRow({ children: [
          new TableCell({
            borders, rowSpan: 2,
            width: { size: 5638, type: WidthType.DXA },
            shading: { fill: 'FFFFFF', type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              children: [new TextRun({ text: 'Energiya auditorlik xulosasi berilgan', bold: true, size: 20, font: 'Times New Roman' })],
            })],
          }),
          cell('Sana', { width: 4000, bold: true }),
        ]}),
        new TableRow({ children: [cell(extra.auditDate, { width: 4000, align: AlignmentType.CENTER })] }),
        new TableRow({ children: [
          cell('Raqami', { width: 5638, bold: true }),
          cell(`№ ${extra.docNumber}`, { width: 4000, align: AlignmentType.CENTER }),
        ]}),
      ],
    });
  }

  function generalTable() {
    const rows = [
      ["Ob'ekt joylashgan manzili", client.address || ''],
      ['Xonadon egasi', client.fullName || ''],
      ["Ob'ektdan foydalanuvchilar soni", `${client.residentsCount || ''} nafar`],
      ["Qurilgan yili / Oxirgi ta'mirlangan yil", `${client.buildYear || ''} / ${client.lastRepairYear || ''}`],
      ['Binolar soni / Qavatliligi / Xonalar soni', `${client.buildingCount || ''} / ${client.floorCount || ''} qavat / ${client.roomCount || ''}`],
      ['Foydalanish maqsadi', client.usagePurpose || ''],
    ];
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: [4000, 5638],
      rows: rows.map(([l, v]) => new TableRow({ children: [
        cell(l, { width: 4000, bold: true }),
        cell(v, { width: 5638 }),
      ]})),
    });
  }

  function archTable() {
    const colW = [5000, 3638, 1000];
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: colW,
      rows: [
        new TableRow({ tableHeader: true, children: [
          cell("Ko'rsatkich", { width: colW[0], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
          cell('Tavsif (material, turi)', { width: colW[1], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
          cell('Maydoni (m²)', { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
        ]}),
        ...(arch || []).map(r => new TableRow({ children: [
          cell(r.name || '', { width: colW[0] }),
          cell(r.desc || '', { width: colW[1] }),
          cell(r.area || '', { width: colW[2], align: AlignmentType.CENTER }),
        ]})),
      ],
    });
  }

  function engTable() {
    const colW = [2500, 4638, 2500];
    const total = (devs || []).reduce((s, d) => s + (d.monthKw || 0), 0).toFixed(2);
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: colW,
      rows: [
        new TableRow({ tableHeader: true, children: [
          cell('Tizim turi', { width: colW[0], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
          cell('Tavsif (qurilma, marka, quvvati)', { width: colW[1], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
          cell('Izoh', { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
        ]}),
        ...(eng || []).map(r => new TableRow({ children: [
          cell(r.type || '', { width: colW[0] }),
          cell(r.desc || '', { width: colW[1] }),
          cell(r.note || '—', { width: colW[2] }),
        ]})),
        new TableRow({ children: [
          new TableCell({
            borders, columnSpan: 2,
            width: { size: colW[0] + colW[1], type: WidthType.DXA },
            shading: { fill: GRAY, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "Jami iste'mol:", bold: true, size: 20, font: 'Times New Roman' })],
            })],
          }),
          cell(`${total} kVt*soat/oy`, { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER }),
        ]}),
      ],
    });
  }

  function devTable() {
    const colW = [500, 2638, 800, 700, 900, 900, 1100, 1100];
    return new Table({
      width: { size: W, type: WidthType.DXA }, columnWidths: colW,
      rows: [
        new TableRow({ tableHeader: true, children: [
          cell('№', { width: colW[0], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('Qurilma nomi', { width: colW[1], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('Quvvati Vt', { width: colW[2], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('Soni dona', { width: colW[3], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('Umumiy quvvati kVt', { width: colW[4], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('Ishlash vaqti soat', { width: colW[5], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('EE sut kVt*soat', { width: colW[6], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell('EE oy kVt*soat', { width: colW[7], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
        ]}),
        ...(devs || []).map(r => new TableRow({ children: [
          cell(r.num || '', { width: colW[0], align: AlignmentType.CENTER, size: 18 }),
          cell(r.name || '', { width: colW[1], size: 18 }),
          cell(r.watt || 0, { width: colW[2], align: AlignmentType.CENTER, size: 18 }),
          cell(r.count || 0, { width: colW[3], align: AlignmentType.CENTER, size: 18 }),
          cell(r.totalKw || 0, { width: colW[4], align: AlignmentType.CENTER, size: 18 }),
          cell(r.hours || 0, { width: colW[5], align: AlignmentType.CENTER, size: 18 }),
          cell(r.dayKw || 0, { width: colW[6], align: AlignmentType.CENTER, size: 18 }),
          cell(r.monthKw || 0, { width: colW[7], align: AlignmentType.CENTER, size: 18 }),
        ]})),
        new TableRow({ children: [
          new TableCell({
            borders, columnSpan: 6,
            width: { size: colW.slice(0, 6).reduce((a, b) => a + b, 0), type: WidthType.DXA },
            shading: { fill: GRAY, type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: 'Umumiysi:', bold: true, size: 18, font: 'Times New Roman' })],
            })],
          }),
          cell((devs || []).reduce((s, d) => s + (d.dayKw || 0), 0).toFixed(2), { width: colW[6], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
          cell((devs || []).reduce((s, d) => s + (d.monthKw || 0), 0).toFixed(2), { width: colW[7], bold: true, shade: GRAY, align: AlignmentType.CENTER, size: 18 }),
        ]}),
      ],
    });
  }

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 11906, height: 16838 },
          margin: { top: 1134, right: 850, bottom: 1134, left: 1134 },
        },
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 0, after: 60 },
          children: [new TextRun({ text: 'ENERGIYA AUDIT XULOSASI', bold: true, size: 32, font: 'Times New Roman' })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER, spacing: { before: 0, after: 200 },
          children: [new TextRun({ text: '(Aholi uy-joylari uchun)', size: 22, font: 'Times New Roman', italics: true })],
        }),
        headerTable(), spacer(),
        boldLabel("I. Umumiy ma'lumot"),
        generalTable(), spacer(),
        heading('II. Uy-joy tavsifi'),
        heading('2.1. Arxitektura va konstruktsiya xususiyatlari', 22),
        spacer(), archTable(), spacer(),
        heading('2.2. Muhandislik tizimlari', 22),
        spacer(), engTable(), spacer(),
        heading("2.3. Asosiy elektr qurilmalari tarkibi va ularning ko'rsatgichlari", 22),
        spacer(), devTable(), spacer(),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [new TextRun({
            text: "Izoh: O'rtacha oylik EE iste'moliga mos keladigan ko'rsatgichlar",
            size: 18, font: 'Times New Roman', italics: true,
          })],
        }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}

// ─── Rasm yuborish ────────────────────────────────────────────────────────────
async function sendPhoto(chatId, base64, mime, caption) {
  const blob = new Blob([Buffer.from(base64, 'base64')], { type: mime || 'image/jpeg' });
  const fd = new FormData();
  fd.append('chat_id', String(chatId));
  fd.append('photo', blob, 'photo.jpg');
  if (caption) fd.append('caption', caption);
  const r = await fetch(`${TG}/sendPhoto`, { method: 'POST', body: fd });
  return r.json();
}

// ─── Vercel Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { chatId, client, extra, arch, eng, devs = [], photos = [] } = req.body;

    if (!BOT_TOKEN) throw new Error("BOT_TOKEN Vercel Environment Variables ga qo'shilmagan");
    if (!chatId) throw new Error('chatId topilmadi');

    // 1. Umumiy rasmlar
    for (let i = 0; i < photos.length; i++) {
      const caption = i === 0
        ? `📸 Ob'ekt rasmlari\n👤 ${client?.fullName}\n📍 ${client?.address}`
        : null;
      await sendPhoto(chatId, photos[i].base64, photos[i].mime, caption);
    }

    // 2. Har bir qurilma rasmlari
    for (const dev of devs) {
      if (dev.photos && dev.photos.length > 0) {
        for (let i = 0; i < dev.photos.length; i++) {
          const caption = i === 0
            ? `🔌 ${dev.num}. ${dev.name || 'Qurilma'} — ${dev.watt}Vt × ${dev.count} dona`
            : null;
          await sendPhoto(chatId, dev.photos[i].base64, dev.photos[i].mime, caption);
        }
      }
    }

    // 3. Word hujjat
    const buffer = await buildDocx({ client, extra, arch, eng, devs });
    const filename = `audit_${(client?.fullName || 'report').replace(/\s+/g, '_')}_${Date.now()}.docx`;
    const caption = `📋 Energiya Audit Xulosasi\n👤 ${client?.fullName}\n📍 ${client?.address}\n📅 ${extra?.auditDate}\n🔢 №${extra?.docNumber}`;

    const fd = new FormData();
    fd.append('chat_id', String(chatId));
    fd.append('document', new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }), filename);
    fd.append('caption', caption);

    const tgRes = await fetch(`${TG}/sendDocument`, { method: 'POST', body: fd });
    const tgData = await tgRes.json();
    if (!tgData.ok) throw new Error(tgData.description || 'Telegram xatolik');

    return res.status(200).json({ ok: true });

  } catch (e) {
    console.error('XATO:', e.message);
    return res.status(500).json({ ok: false, error: e.message });
  }
}