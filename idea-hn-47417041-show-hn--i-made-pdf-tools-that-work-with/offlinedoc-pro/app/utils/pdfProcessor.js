import { PDFDocument, rgb, degrees } from 'pdf-lib';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

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

    // Get image dimensions
    const manipResult = await ImageManipulator.manipulateAsync(
      imageUri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([manipResult.width, manipResult.height]);

    // Embed the image in the PDF
    const jpgImage = await pdfDoc.embedJpg(imageData);

    // Draw the image on the page
    page.drawImage(jpgImage, {
      x: 0,
      y: 0,
      width: manipResult.width,
      height: manipResult.height,
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return pdfBytes;
  } catch (error) {
    console.error('Error converting image to PDF:', error);
    throw error;
  }
};
