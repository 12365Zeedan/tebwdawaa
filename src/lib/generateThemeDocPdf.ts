import jsPDF from 'jspdf';
import { themeDocSections } from '@/data/themeDocumentation';

type Lang = 'en' | 'ar';

export function generateThemeDocPdf(language: Lang) {
  const isAr = language === 'ar';
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const checkPage = (needed: number) => {
    if (y + needed > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Title Page ──
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  const title = isAr ? 'دليل إعداد القالب' : 'Theme Setup Documentation';
  doc.text(title, pageW / 2, pageH / 3, { align: 'center' });

  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const subtitle = isAr
    ? 'دليل شامل خطوة بخطوة لإعداد وتخصيص جميع مكونات القالب'
    : 'A comprehensive step-by-step guide to setting up and customizing all theme components';
  const subtitleLines = doc.splitTextToSize(subtitle, contentW);
  doc.text(subtitleLines, pageW / 2, pageH / 3 + 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const dateStr = new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(dateStr, pageW / 2, pageH / 3 + 35, { align: 'center' });
  doc.setTextColor(0, 0, 0);

  // ── Table of Contents ──
  doc.addPage();
  y = margin;
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(isAr ? 'جدول المحتويات' : 'Table of Contents', margin, y);
  y += 12;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  themeDocSections.forEach((section, idx) => {
    checkPage(8);
    const sectionTitle = isAr ? section.titleAr : section.titleEn;
    doc.text(`${idx + 1}. ${sectionTitle}`, margin + 4, y);
    y += 7;

    section.items.forEach((item) => {
      checkPage(6);
      doc.setTextColor(100, 100, 100);
      const itemTitle = isAr ? item.titleAr : item.titleEn;
      doc.text(`    • ${itemTitle}`, margin + 10, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    });
    y += 2;
  });

  // ── Sections ──
  themeDocSections.forEach((section, sIdx) => {
    doc.addPage();
    y = margin;

    // Section header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    const sectionTitle = isAr ? section.titleAr : section.titleEn;
    doc.text(`${sIdx + 1}. ${sectionTitle}`, margin, y);
    y += 10;

    // Section items
    section.items.forEach((item) => {
      checkPage(30);

      // Item title
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const itemTitle = isAr ? item.titleAr : item.titleEn;
      doc.text(itemTitle, margin, y);
      y += 8;

      // Description
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      const desc = isAr ? item.descriptionAr : item.descriptionEn;
      const descLines = doc.splitTextToSize(desc, contentW);
      checkPage(descLines.length * 5 + 5);
      doc.text(descLines, margin, y);
      y += descLines.length * 5 + 4;
      doc.setTextColor(0, 0, 0);

      // Steps header
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(isAr ? 'الخطوات:' : 'Steps:', margin, y);
      y += 6;

      // Steps
      doc.setFont('helvetica', 'normal');
      item.steps.forEach((step, stepIdx) => {
        const stepText = `${stepIdx + 1}. ${isAr ? step.ar : step.en}`;
        const stepLines = doc.splitTextToSize(stepText, contentW - 6);
        checkPage(stepLines.length * 5 + 3);
        doc.text(stepLines, margin + 4, y);
        y += stepLines.length * 5 + 2;
      });

      // Tips
      if (item.tips && item.tips.length > 0) {
        y += 3;
        checkPage(20);
        doc.setFillColor(245, 245, 245);
        const tipStartY = y - 2;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(isAr ? 'نصائح:' : 'Tips:', margin + 4, y + 2);
        y += 8;

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        item.tips.forEach((tip) => {
          const tipText = `• ${isAr ? tip.ar : tip.en}`;
          const tipLines = doc.splitTextToSize(tipText, contentW - 12);
          checkPage(tipLines.length * 5 + 3);
          doc.text(tipLines, margin + 8, y);
          y += tipLines.length * 5 + 2;
        });

        // Draw tip background
        const tipHeight = y - tipStartY + 2;
        doc.setDrawColor(220, 220, 220);
        doc.roundedRect(margin, tipStartY - 3, contentW, tipHeight, 2, 2, 'S');
        doc.setTextColor(0, 0, 0);
        y += 4;
      }

      y += 8;
    });
  });

  // Page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `${isAr ? 'صفحة' : 'Page'} ${i - 1} / ${totalPages - 1}`,
      pageW / 2,
      pageH - 10,
      { align: 'center' }
    );
  }

  const fileName = isAr ? 'دليل_إعداد_القالب.pdf' : 'Theme_Setup_Documentation.pdf';
  doc.save(fileName);
}
