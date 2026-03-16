const { PDFDocument } = require('pdf-lib');

class PDFConverter {
  static async convert(files) {
    try {
      // Validate file types
      const allowedTypes = ['application/pdf'];
      files.forEach(file => fileHandler.validateFile(file, allowedTypes));

      // Get conversion options
      const action = document.getElementById('actionSelect').value;

      // Process based on action
      let result;
      switch (action) {
        case 'merge':
          result = await this.mergePDFs(files);
          break;
        case 'split':
          result = await this.splitPDF(files[0]);
          break;
        case 'compress':
          result = await this.compressPDF(files[0]);
          break;
        case 'pdf-to-images':
          result = await this.pdfToImages(files[0]);
          break;
        default:
          throw new Error('Invalid PDF action');
      }

      return result;
    } catch (error) {
      UIManager.showError(error.message);
      throw error;
    }
  }

  static async mergePDFs(files) {
    const mergedPdf = await PDFDocument.create();

    for (const file of files) {
      const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
      const pdf = await PDFDocument.load(arrayBuffer);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach(page => mergedPdf.addPage(page));
    }

    const mergedPdfBytes = await mergedPdf.save();
    const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
    const filename = 'merged.pdf';

    return { blob, filename };
  }

  static async splitPDF(file) {
    const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(arrayBuffer);

    // For simplicity, we'll split into individual pages
    const zip = new JSZip();
    for (let i = 0; i < pdf.getPageCount(); i++) {
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdf, [i]);
      newPdf.addPage(copiedPage);

      const newPdfBytes = await newPdf.save();
      zip.file(`page_${i + 1}.pdf`, newPdfBytes);
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const filename = 'split_pages.zip';

    return { blob: content, filename };
  }

  static async compressPDF(file) {
    const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
    const pdf = await PDFDocument.load(arrayBuffer, {
      updateMetadata: false,
      throwOnInvalidObject: false,
    });

    // Save with compression
    const compressedPdfBytes = await pdf.save({
      useObjectStreams: false,
      addDefaultPage: false,
    });

    const blob = new Blob([compressedPdfBytes], { type: 'application/pdf' });
    const filename = 'compressed.pdf';

    return { blob, filename };
  }

  static async pdfToImages(file) {
    // Note: This is a simplified version. In a real implementation,
    // you would need to use a library like pdf.js to render PDF pages
    // to canvas and then convert to images.
    throw new Error('PDF to Images conversion not fully implemented in this prototype');
  }
}
