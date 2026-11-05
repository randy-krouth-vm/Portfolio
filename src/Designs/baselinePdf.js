/*
    Builds a printable copy of the Security Baseline. The heavy PDF library is
    loaded only when someone actually exports, so it stays out of the page bundle.
*/

const PAGE_MARGIN = 16;
const BODY_FONT_SIZE = 9;
const LINE_HEIGHT = 4.3;
const PARAGRAPH_GAP = 1.7;
const CHECKBOX_SIZE = 3.1;
const BODY_TOP = 44;
const CONTENT_BOTTOM = 22;

const INK = [51, 71, 95];
const MUTED = [111, 130, 149];
const RULE = [210, 220, 229];
const BRAND = [11, 127, 196];
const WHITE = [255, 255, 255];

const setFill = (pdf, [r, g, b]) => pdf.setFillColor(r, g, b);
const setDraw = (pdf, [r, g, b]) => pdf.setDrawColor(r, g, b);
const setText = (pdf, [r, g, b]) => pdf.setTextColor(r, g, b);

export async function buildSecurityBaselinePdf(design, checked) {
    const { jsPDF } = await import("jspdf");
    const pdf = new jsPDF({ unit: "mm", format: "a4", compress: true });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const contentWidth = pageWidth - PAGE_MARGIN * 2;
    const total = design.items.length;
    const marked = checked.size;
    const percent = total ? Math.round((marked / total) * 100) : 0;
    const generated = new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    pdf.setProperties({
        title: `${design.title} — Security checklist`,
        subject: "Architecture review checklist",
        author: "Randall Krouth",
        creator: "Randall Krouth Portfolio",
    });

    const drawFirstHeader = () => {
        setText(pdf, INK);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(19);
        pdf.text(design.heading || design.title, PAGE_MARGIN, 21);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        setText(pdf, MUTED);
        pdf.text("Architecture review checklist", PAGE_MARGIN, 27.5);

        pdf.setFontSize(8);
        pdf.text(`${marked} of ${total} checks marked  -  ${percent}%`, PAGE_MARGIN, 33);
        pdf.text(generated, pageWidth - PAGE_MARGIN, 33, { align: "right" });

        setDraw(pdf, RULE);
        pdf.setLineWidth(0.25);
        pdf.line(PAGE_MARGIN, 37.5, pageWidth - PAGE_MARGIN, 37.5);
    };

    const drawContinuationHeader = () => {
        setText(pdf, INK);
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(9.5);
        pdf.text(`${design.heading || design.title} — continued`, PAGE_MARGIN, 14);

        setDraw(pdf, RULE);
        pdf.setLineWidth(0.25);
        pdf.line(PAGE_MARGIN, 17.5, pageWidth - PAGE_MARGIN, 17.5);

        pdf.setFont("helvetica", "normal");
        setText(pdf, MUTED);
        pdf.setFontSize(8);
        pdf.text(`${marked} of ${total} marked`, pageWidth - PAGE_MARGIN, 14, { align: "right" });
    };

    const newPage = (first = false) => {
        if (!first) pdf.addPage();
        pdf.setFont("helvetica", "normal");
        if (first) drawFirstHeader();
        else drawContinuationHeader();
    };

    const drawCheckbox = (x, y, isMarked) => {
        if (isMarked) {
            setFill(pdf, BRAND);
            setDraw(pdf, BRAND);
            pdf.roundedRect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, 0.55, 0.55, "FD");
            setDraw(pdf, WHITE);
            pdf.setLineWidth(0.4);
            pdf.line(x + 0.7, y + 1.55, x + 1.25, y + 2.15);
            pdf.line(x + 1.25, y + 2.15, x + 2.35, y + 0.85);
        } else {
            setDraw(pdf, [142, 159, 175]);
            pdf.setLineWidth(0.25);
            pdf.roundedRect(x, y, CHECKBOX_SIZE, CHECKBOX_SIZE, 0.55, 0.55, "S");
        }
    };

    newPage(true);
    let cursorY = BODY_TOP;

    design.items.forEach((label, index) => {
        const isMarked = checked.has(label);
        const lines = pdf.splitTextToSize(label, contentWidth - 14);
        const rowHeight = lines.length * LINE_HEIGHT + PARAGRAPH_GAP;

        if (cursorY + rowHeight > pageHeight - CONTENT_BOTTOM) {
            newPage();
            cursorY = 24;
        }

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7);
        setText(pdf, MUTED);
        pdf.text(String(index + 1).padStart(2, "0"), PAGE_MARGIN, cursorY + 2.65, { align: "right" });

        drawCheckbox(PAGE_MARGIN + 5.5, cursorY + 0.2, isMarked);

        pdf.setFontSize(BODY_FONT_SIZE);
        setText(pdf, isMarked ? MUTED : INK);
        lines.forEach((line, lineIndex) => {
            pdf.text(line, PAGE_MARGIN + 11, cursorY + 2.8 + lineIndex * LINE_HEIGHT);
        });

        cursorY += rowHeight;
    });

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(7.5);
        setText(pdf, MUTED);
        pdf.text("Security Baseline", PAGE_MARGIN, pageHeight - 8);
        pdf.text(`${page} / ${pageCount}`, pageWidth - PAGE_MARGIN, pageHeight - 8, { align: "right" });
    }

    return pdf;
}

export async function exportSecurityBaselinePdf(design, checked) {
    const pdf = await buildSecurityBaselinePdf(design, checked);
    const url = URL.createObjectURL(pdf.output("blob"));
    const link = document.createElement("a");
    link.href = url;
    link.download = "Security_Baseline.pdf";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
