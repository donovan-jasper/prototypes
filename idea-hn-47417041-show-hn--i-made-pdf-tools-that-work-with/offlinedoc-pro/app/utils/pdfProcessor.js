import { PDFDocument, rgb } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';

export const mergePDFs = async (pdfs) => {
  const mergedPdf = await PDFDocument.create();
  for (const pdf of pdfs) {
    const pdfDoc = await PDFDocument.load(pdf);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

export const convertImageToPDF = async (imageUri) => {
  try {
    // Read the image file
    const imageData = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);

    // In a real implementation, you would:
    // 1. Get image dimensions
    // 2. Embed the image in the PDF
    // 3. Draw the image on the page

    // For this example, we'll just add a placeholder
    page.drawText('Converted Image', {
      x: 50,
      y: 750,
      size: 30,
      color: rgb(0, 0, 0),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error converting image to PDF:', error);
    throw error;
  }
};
