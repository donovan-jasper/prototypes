import { PDFDocument } from 'pdf-lib';

export const mergePDFs = async (pdfs) => {
  const mergedPdf = await PDFDocument.create();
  for (const pdf of pdfs) {
    const pdfDoc = await PDFDocument.load(pdf);
    const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  return await mergedPdf.save();
};

export const convertImageToPDF = async (imageData) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);
  // Add image to the page
  // Add your image conversion logic here
  return await pdfDoc.save();
};
