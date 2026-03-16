import { PDFDocument, rgb } from '@react-native-pdf/pdf-lib';
import { Transaction } from './types';
import { format } from 'date-fns';
import { canExportPDF } from './subscription';

export const generateAuditPDF = async (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date
) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  // Add cover page
  page.drawText('Financial Audit Trail', {
    x: 50,
    y: height - 50,
    size: 24,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Date Range: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, {
    x: 50,
    y: height - 80,
    size: 12,
    color: rgb(0, 0, 0),
  });

  // Add transaction ledger
  let yPosition = height - 120;
  for (const tx of transactions) {
    page.drawText(`${format(tx.date, 'MMM dd, yyyy')} - ${tx.payee} - $${tx.amount.toFixed(2)}`, {
      x: 50,
      y: yPosition,
      size: 10,
      color: rgb(0, 0, 0),
    });
    yPosition -= 20;
  }

  // Add watermark for free tier
  if (!(await canExportPDF())) {
    page.drawText('Generated with TraceGuard Free', {
      x: width - 200,
      y: 30,
      size: 10,
      color: rgb(0.8, 0.8, 0.8),
      opacity: 0.5,
      rotate: degrees(-45),
    });
  }

  const pdfBytes = await pdfDoc.saveAsBase64();
  return pdfBytes;
};
