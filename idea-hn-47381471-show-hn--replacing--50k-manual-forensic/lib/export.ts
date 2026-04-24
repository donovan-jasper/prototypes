import { PDFDocument, rgb, StandardFonts } from '@react-native-pdf/pdf-lib';
import { Transaction } from './types';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';

export const generateAuditPDF = async (
  transactions: Transaction[],
  startDate: Date,
  endDate: Date,
  includeDocuments: boolean = false
): Promise<string> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  const { width, height } = page.getSize();

  // Embed fonts
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBoldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Add title
  page.drawText('Financial Audit Trail', {
    x: 50,
    y: height - 50,
    size: 24,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  // Add date range
  page.drawText(`Date Range: ${format(startDate, 'MM/dd/yyyy')} - ${format(endDate, 'MM/dd/yyyy')}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // Add summary
  const deposits = transactions.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0);
  const withdrawals = transactions.filter(tx => tx.type === 'withdrawal').reduce((sum, tx) => sum + tx.amount, 0);
  const fees = transactions.reduce((sum, tx) => sum + (tx.fee || 0), 0);
  const interest = transactions.filter(tx => tx.type === 'interest').reduce((sum, tx) => sum + tx.amount, 0);

  page.drawText(`Total Deposits: $${deposits.toFixed(2)}`, {
    x: 50,
    y: height - 110,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Total Withdrawals: $${Math.abs(withdrawals).toFixed(2)}`, {
    x: 50,
    y: height - 130,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Total Fees: $${fees.toFixed(2)}`, {
    x: 50,
    y: height - 150,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  page.drawText(`Total Interest Earned: $${interest.toFixed(2)}`, {
    x: 50,
    y: height - 170,
    size: 12,
    font: helveticaFont,
    color: rgb(0, 0, 0),
  });

  // Add transaction table header
  page.drawText('Date', {
    x: 50,
    y: height - 200,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Payee', {
    x: 150,
    y: height - 200,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Type', {
    x: 300,
    y: height - 200,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Amount', {
    x: 400,
    y: height - 200,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  page.drawText('Balance', {
    x: 500,
    y: height - 200,
    size: 12,
    font: helveticaBoldFont,
    color: rgb(0, 0, 0),
  });

  // Add transaction rows
  let yPosition = height - 220;
  for (const tx of transactions) {
    if (yPosition < 100) {
      // Add new page if we're running out of space
      const newPage = pdfDoc.addPage([600, 800]);
      yPosition = newPage.getSize().height - 50;
      page = newPage;
    }

    page.drawText(format(new Date(tx.date), 'MM/dd/yyyy'), {
      x: 50,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(tx.payee, {
      x: 150,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(tx.type, {
      x: 300,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    page.drawText(`${tx.type === 'deposit' ? '+' : '-'}$${Math.abs(tx.amount).toFixed(2)}`, {
      x: 400,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: tx.type === 'deposit' ? rgb(0, 0.5, 0) : rgb(0.5, 0, 0),
    });

    page.drawText(`$${tx.runningBalance?.toFixed(2) || '0.00'}`, {
      x: 500,
      y: yPosition,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    yPosition -= 20;
  }

  // Add document hashes section if documents are included
  if (includeDocuments) {
    const documentsPage = pdfDoc.addPage([600, 800]);
    const { width: docWidth, height: docHeight } = documentsPage.getSize();

    documentsPage.drawText('Document Hashes', {
      x: 50,
      y: docHeight - 50,
      size: 18,
      font: helveticaBoldFont,
      color: rgb(0, 0, 0),
    });

    let docYPosition = docHeight - 80;
    for (const tx of transactions) {
      if (tx.documentHash && tx.documentId) {
        if (docYPosition < 100) {
          const newPage = pdfDoc.addPage([600, 800]);
          docYPosition = newPage.getSize().height - 50;
          documentsPage = newPage;
        }

        documentsPage.drawText(`Document ID: ${tx.documentId}`, {
          x: 50,
          y: docYPosition,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        documentsPage.drawText(`Hash: ${tx.documentHash}`, {
          x: 50,
          y: docYPosition - 15,
          size: 10,
          font: helveticaFont,
          color: rgb(0, 0, 0),
        });

        docYPosition -= 30;
      }
    }
  }

  // Add footer
  const pages = pdfDoc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText('Generated with TraceGuard', {
      x: 50,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: rgb(0.5, 0.5, 0.5),
    });
  }

  // Serialize the PDFDocument to bytes (a Uint8Array)
  const pdfBytes = await pdfDoc.save();

  // Write to file system
  const fileUri = `${FileSystem.documentDirectory}audit-trail-${Date.now()}.pdf`;
  await FileSystem.writeAsStringAsync(fileUri, pdfBytes.toString(), {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};
