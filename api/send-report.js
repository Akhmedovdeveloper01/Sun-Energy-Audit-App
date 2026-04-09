// @vercel/node
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    AlignmentType,
    BorderStyle,
    WidthType,
    ShadingType,
    VerticalAlign,
    ImageRun,
} from "docx";

const ALLOWED_IDS = [1727203202, 873890399];

const BOT_TOKEN = process.env.BOT_TOKEN;
const TG = `https://api.telegram.org/bot${BOT_TOKEN}`;
const W = 9638;
const border = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = {
    top: noBorder,
    bottom: noBorder,
    left: noBorder,
    right: noBorder,
};

function cell(text, opts = {}) {
    const {
        width = 2000,
        bold = false,
        shade = "FFFFFF",
        align = AlignmentType.LEFT,
        size = 20,
        colSpan,
        italics = false,
    } = opts;
    return new TableCell({
        borders,
        columnSpan: colSpan,
        verticalAlign: VerticalAlign.CENTER,
        width: { size: width, type: WidthType.DXA },
        shading: { fill: shade, type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [
            new Paragraph({
                alignment: align,
                children: [
                    new TextRun({
                        text: String(text ?? ""),
                        bold,
                        size,
                        font: "Times New Roman",
                        italics,
                    }),
                ],
            }),
        ],
    });
}

function heading(text, sz = 24) {
    return new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 80 },
        children: [
            new TextRun({
                text,
                bold: true,
                size: sz,
                font: "Times New Roman",
            }),
        ],
    });
}

function boldLabel(text) {
    return new Paragraph({
        spacing: { before: 80, after: 60 },
        children: [
            new TextRun({
                text,
                bold: true,
                size: 20,
                font: "Times New Roman",
            }),
        ],
    });
}

function spacer() {
    return new Paragraph({
        children: [new TextRun("")],
        spacing: { before: 60, after: 60 },
    });
}

// ─── Rasm turini aniqlash (base64 boshlanmasiga qarab) ───────────────────────
function detectImageType(base64) {
    if (!base64) return "jpg";
    if (base64.startsWith("/9j/")) return "jpg";
    if (base64.startsWith("iVBOR")) return "png";
    if (base64.startsWith("R0lGO")) return "gif";
    if (base64.startsWith("UklGR")) return "bmp";
    return "jpg"; // default
}

// ─── 2 ustunli rasm grid ─────────────────────────────────────────────────────
// colW = [4700, 4700] (ikki teng ustun, oraliq 238 DXA)
// Rasm o'lchami EMU: 1 sm = 914400 EMU, 1 inch = 914400 EMU
// A4 content = ~17cm, 1 ustun = ~8cm = 7315200 EMU

function buildPhotoGrid(photos, sectionTitle) {
    try {
        const COL = 4700; // DXA, ikki ustun

        const elements = [];

        if (sectionTitle) {
            elements.push(heading(sectionTitle, 22));
            elements.push(spacer());
        }

        // Bo'sh cell
        const emptyCell = () =>
            new TableCell({
                borders: noBorders,
                width: { size: COL, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun("")] })],
            });

        // Rasm cell yaratuvchi funksiya — xato bo'lsa bo'sh cell qaytaradi
        const imgCell = (photo, label) => {
            try {
                if (!photo?.base64) return emptyCell();
                const imgBuf = Buffer.from(photo.base64, "base64");
                const imgType = detectImageType(photo.base64);
                return new TableCell({
                    borders: noBorders,
                    width: { size: COL, type: WidthType.DXA },
                    margins: { top: 60, bottom: 60, left: 60, right: 60 },
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new ImageRun({
                                    data: imgBuf,
                                    transformation: { width: 330, height: 250 },
                                    type: imgType,
                                }),
                            ],
                        }),
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 40, after: 40 },
                            children: [
                                new TextRun({
                                    text: label || "",
                                    size: 18,
                                    font: "Times New Roman",
                                    italics: true,
                                }),
                            ],
                        }),
                    ],
                });
            } catch (cellErr) {
                console.error(
                    "imgCell xatosi:",
                    cellErr.message,
                    "| Rasm:",
                    photo?.name
                );
                return emptyCell();
            }
        };

        // Juft-juft qilib jadval yaratamiz
        const rows = [];
        for (let i = 0; i < photos.length; i += 2) {
            const left = photos[i];
            const right = photos[i + 1];
            try {
                rows.push(
                    new TableRow({
                        children: [
                            imgCell(left, left.caption || ""),
                            right
                                ? imgCell(right, right.caption || "")
                                : emptyCell(),
                        ],
                    })
                );
            } catch (rowErr) {
                console.error("TableRow xatosi:", rowErr.message);
            }
        }

        if (rows.length > 0) {
            elements.push(
                new Table({
                    width: { size: W, type: WidthType.DXA },
                    columnWidths: [COL, COL],
                    rows,
                })
            );
            elements.push(spacer());
        }

        return elements;
    } catch (err) {
        console.error("buildPhotoGrid umumiy xatosi:", err.message);
        return []; // Hujjatni to'xtatmasdan, rasmlar bo'limini o'tkazib yuboradi
    }
}

async function buildDocx({ client, extra, arch, eng, devs, photos }) {
    const GRAY = "D9D9D9";

    function headerTable() {
        return new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [5638, 4000],
            rows: [
                new TableRow({
                    children: [
                        cell(
                            "Energiya auditorlik xulosasi shakllantirirlgan sana",
                            { width: 5638, bold: true }
                        ),
                        cell(extra.formDate, {
                            width: 4000,
                            align: AlignmentType.CENTER,
                        }),
                    ],
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            borders,
                            rowSpan: 2,
                            width: { size: 5638, type: WidthType.DXA },
                            shading: {
                                fill: "FFFFFF",
                                type: ShadingType.CLEAR,
                            },
                            margins: {
                                top: 80,
                                bottom: 80,
                                left: 120,
                                right: 120,
                            },
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: "Energiya auditorlik xulosasi berilgan",
                                            bold: true,
                                            size: 20,
                                            font: "Times New Roman",
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        cell("Sana", { width: 4000, bold: true }),
                    ],
                }),
                new TableRow({
                    children: [
                        cell(extra.auditDate, {
                            width: 4000,
                            align: AlignmentType.CENTER,
                        }),
                    ],
                }),
                new TableRow({
                    children: [
                        cell("Raqami", { width: 5638, bold: true }),
                        cell(`№ ${extra.docNumber}`, {
                            width: 4000,
                            align: AlignmentType.CENTER,
                        }),
                    ],
                }),
            ],
        });
    }

    function generalTable() {
        const rows = [
            ["Ob'ekt joylashgan manzili", client.address || ""],
            ["Xonadon egasi", client.fullName || ""],
            [
                "Ob'ektdan foydalanuvchilar soni",
                `${client.residentsCount || ""} nafar`,
            ],
            [
                "Qurilgan yili / Oxirgi ta'mirlangan yil",
                `${client.buildYear || ""} / ${client.lastRepairYear || ""}`,
            ],
            [
                "Binolar soni / Qavatliligi / Xonalar soni",
                `${client.buildingCount || ""} / ${
                    client.floorCount || ""
                } qavat / ${client.roomCount || ""}`,
            ],
            ["Foydalanish maqsadi", client.usagePurpose || ""],
        ];
        return new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: [4000, 5638],
            rows: rows.map(
                ([l, v]) =>
                    new TableRow({
                        children: [
                            cell(l, { width: 4000, bold: true }),
                            cell(v, { width: 5638 }),
                        ],
                    })
            ),
        });
    }

    function archTable() {
        const colW = [5000, 3638, 1000];
        return new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: colW,
            rows: [
                new TableRow({
                    tableHeader: true,
                    children: [
                        cell("Ko'rsatkich", {
                            width: colW[0],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                        }),
                        cell("Tavsif (material, turi)", {
                            width: colW[1],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                        }),
                        cell("Maydoni (m²)", {
                            width: colW[2],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                        }),
                    ],
                }),
                ...(arch || []).map(
                    (r) =>
                        new TableRow({
                            children: [
                                cell(r.name || "", { width: colW[0] }),
                                cell(r.desc || "", { width: colW[1] }),
                                cell(r.area || "", {
                                    width: colW[2],
                                    align: AlignmentType.CENTER,
                                }),
                            ],
                        })
                ),
            ],
        });
    }

    function devTable() {
        const colW = [500, 2638, 800, 700, 900, 900, 1100, 1100];
        return new Table({
            width: { size: W, type: WidthType.DXA },
            columnWidths: colW,
            rows: [
                new TableRow({
                    tableHeader: true,
                    children: [
                        cell("№", {
                            width: colW[0],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("Qurilma nomi", {
                            width: colW[1],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("Quvvati Vt", {
                            width: colW[2],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("Soni dona", {
                            width: colW[3],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("Umumiy quvvati kVt", {
                            width: colW[4],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("Ishlash vaqti soat", {
                            width: colW[5],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("EE sut kVt*soat", {
                            width: colW[6],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                        cell("EE oy kVt*soat", {
                            width: colW[7],
                            bold: true,
                            shade: GRAY,
                            align: AlignmentType.CENTER,
                            size: 18,
                        }),
                    ],
                }),
                ...(devs || []).map(
                    (r) =>
                        new TableRow({
                            children: [
                                cell(r.num || "", {
                                    width: colW[0],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                                cell(r.name || "", {
                                    width: colW[1],
                                    size: 18,
                                }),
                                cell(r.watt || 0, {
                                    width: colW[2],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                                cell(r.count || 0, {
                                    width: colW[3],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                                cell(r.totalKw || 0, {
                                    width: colW[4],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                                cell(r.hours || 0, {
                                    width: colW[5],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                                cell(r.dayKw || 0, {
                                    width: colW[6],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                                cell(r.monthKw || 0, {
                                    width: colW[7],
                                    align: AlignmentType.CENTER,
                                    size: 18,
                                }),
                            ],
                        })
                ),
                new TableRow({
                    children: [
                        new TableCell({
                            borders,
                            columnSpan: 6,
                            width: {
                                size: colW
                                    .slice(0, 6)
                                    .reduce((a, b) => a + b, 0),
                                type: WidthType.DXA,
                            },
                            shading: { fill: GRAY, type: ShadingType.CLEAR },
                            margins: {
                                top: 80,
                                bottom: 80,
                                left: 120,
                                right: 120,
                            },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.RIGHT,
                                    children: [
                                        new TextRun({
                                            text: "Umumiysi:",
                                            bold: true,
                                            size: 18,
                                            font: "Times New Roman",
                                        }),
                                    ],
                                }),
                            ],
                        }),
                        cell(
                            (devs || [])
                                .reduce((s, d) => s + (d.dayKw || 0), 0)
                                .toFixed(2),
                            {
                                width: colW[6],
                                bold: true,
                                shade: GRAY,
                                align: AlignmentType.CENTER,
                                size: 18,
                            }
                        ),
                        cell(
                            (devs || [])
                                .reduce((s, d) => s + (d.monthKw || 0), 0)
                                .toFixed(2),
                            {
                                width: colW[7],
                                bold: true,
                                shade: GRAY,
                                align: AlignmentType.CENTER,
                                size: 18,
                            }
                        ),
                    ],
                }),
            ],
        });
    }

    // ─── Hujjat children ─────────────────────────────────────────────────────
    const children = [
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 60 },
            children: [
                new TextRun({
                    text: "ENERGIYA AUDIT XULOSASI",
                    bold: true,
                    size: 32,
                    font: "Times New Roman",
                }),
            ],
        }),
        new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 200 },
            children: [
                new TextRun({
                    text: "(Aholi uy-joylari uchun)",
                    size: 22,
                    font: "Times New Roman",
                    italics: true,
                }),
            ],
        }),
        headerTable(),
        spacer(),
        boldLabel("I. Umumiy ma'lumot"),
        generalTable(),
        spacer(),
        heading("II. Uy-joy tavsifi"),
        heading("2.1. Arxitektura va konstruktsiya xususiyatlari", 22),
        spacer(),
        archTable(),
        spacer(),
        heading(
            "2.3. Asosiy elektr qurilmalari tarkibi va ularning ko'rsatgichlari",
            22
        ),
        spacer(),
        devTable(),
        spacer(),
        new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [
                new TextRun({
                    text: "Izoh: O'rtacha oylik EE iste'moliga mos keladigan ko'rsatgichlar",
                    size: 18,
                    font: "Times New Roman",
                    italics: true,
                }),
            ],
        }),
    ];

    // ─── Umumiy rasmlar ───────────────────────────────────────────────────────
    const generalWithCaption = (photos || []).map((p, i) => ({
        ...p,
        caption: `Rasm ${i + 1}`,
    }));
    if (generalWithCaption.length > 0) {
        children.push(spacer());
        children.push(heading("III. Ob'ekt rasmlari", 22));
        children.push(...buildPhotoGrid(generalWithCaption, null));
    }

    // ─── Har bir qurilma rasmlari ─────────────────────────────────────────────
    const devsWithPhotos = (devs || []).filter(
        (d) => d.photos && d.photos.length > 0
    );
    if (devsWithPhotos.length > 0) {
        children.push(heading("IV. Qurilmalar rasmlari", 22));
        children.push(spacer());
        // for (const dev of devsWithPhotos) {
        //   const label = `${dev.num}. ${dev.name || 'Qurilma'} — ${dev.watt} Vt × ${dev.count} dona`;
        //   const photosWithCaption = dev.photos.map((p, i) => ({
        //     ...p,
        //     caption: i === 0 ? label : '',
        //   }));
        //   children.push(...buildPhotoGrid(photosWithCaption, label));
        // }
        for (const dev of devsWithPhotos) {
            const label = `${dev.num}. ${dev.name || "Qurilma"} — ${
                dev.watt
            } Vt × ${dev.count} dona`;
            const photosWithCaption = dev.photos.map(() => ({
                ...p,
                caption: label, // rasm ostida qurilma nomi
            }));
            children.push(...buildPhotoGrid(photosWithCaption, null)); // null = sarlavha yo'q
        }
    }

    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        size: { width: 11906, height: 16838 },
                        margin: {
                            top: 1134,
                            right: 850,
                            bottom: 1134,
                            left: 1134,
                        },
                    },
                },
                children,
            },
        ],
    });

    return Packer.toBuffer(doc);
}

// ─── Vercel Handler ───────────────────────────────────────────────────────────
export default async function handler(req, res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");

    if (req.method === "OPTIONS") return res.status(200).end();
    if (req.method !== "POST")
        return res.status(405).json({ error: "Method not allowed" });

    try {
        const {
            chatId,
            client,
            extra,
            arch,
            devs = [],
            photos = [],
        } = req.body;

        if (!ALLOWED_IDS.includes(Number(chatId))) {
            return res.status(403).json({
                ok: false,
                error: "Sizda ushbu xizmatdan foydalanish huquqi yo'q. Admin bilan bog'laning: @Ahmedov_Mahmud",
            });
        }

        if (!BOT_TOKEN)
            throw new Error(
                "BOT_TOKEN Vercel Environment Variables ga qo'shilmagan"
            );
        if (!chatId) throw new Error("chatId topilmadi");

        // Word hujjat yaratish (rasmlar ichida)
        const buffer = await buildDocx({ client, extra, arch, devs, photos });

        const filename = `audit_${(client?.fullName || "report").replace(
            /\s+/g,
            "_"
        )}_${Date.now()}.docx`;
        const caption = `📋 Energiya Audit Xulosasi\n👤 ${client?.fullName}\n📍 ${client?.address}\n📅 ${extra?.auditDate}\n🔢 №${extra?.docNumber}`;

        const fd = new FormData();
        fd.append("chat_id", String(chatId));
        fd.append(
            "document",
            new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            }),
            filename
        );
        fd.append("caption", caption);

        const tgRes = await fetch(`${TG}/sendDocument`, {
            method: "POST",
            body: fd,
        });
        const tgData = await tgRes.json();
        if (!tgData.ok)
            throw new Error(tgData.description || "Telegram xatolik");

        return res.status(200).json({ ok: true });
    } catch (e) {
        console.error("XATO:", e.message);
        return res.status(500).json({ ok: false, error: e.message });
    }
}
