import { PDFDocument } from 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/+esm';

export default class PDFConverter {
  constructor() {
    this.pdfLib = null;
  }

  async mergePDFs(files) {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => {
          mergedPdf.addPage(page);
        });
      }
      
      const mergedPdfBytes = await mergedPdf.save();
      return new Blob([mergedPdfBytes], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(`Failed to merge PDFs: ${error.message}`);
    }
  }

  async splitPDF(file, pageRanges) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const totalPages = pdf.getPageCount();
      
      const ranges = this.parsePageRanges(pageRanges, totalPages);
      const newPdf = await PDFDocument.create();
      
      for (const pageIndex of ranges) {
        const [copiedPage] = await newPdf.copyPages(pdf, [pageIndex]);
        newPdf.addPage(copiedPage);
      }
      
      const pdfBytes = await newPdf.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(`Failed to split PDF: ${error.message}`);
    }
  }

  parsePageRanges(rangeString, totalPages) {
    const pages = new Set();
    const parts = rangeString.split(',').map(s => s.trim());
    
    for (const part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (isNaN(start) || isNaN(end)) continue;
        
        const startPage = Math.max(1, Math.min(start, totalPages));
        const endPage = Math.max(1, Math.min(end, totalPages));
        
        for (let i = startPage; i <= endPage; i++) {
          pages.add(i - 1);
        }
      } else {
        const pageNum = parseInt(part);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
          pages.add(pageNum - 1);
        }
      }
    }
    
    return Array.from(pages).sort((a, b) => a - b);
  }

  async compressPDF(file, quality = 0.7) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      
      const pages = pdf.getPages();
      for (const page of pages) {
        const { width, height } = page.getSize();
        
        const scaleFactor = Math.sqrt(quality);
        if (scaleFactor < 1) {
          page.scale(scaleFactor, scaleFactor);
        }
      }
      
      const pdfBytes = await pdf.save({
        useObjectStreams: true,
        addDefaultPage: false,
        objectsPerTick: 50,
      });
      
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (error) {
      throw new Error(`Failed to compress PDF: ${error.message}`);
    }
  }

  async pdfToImages(file, format = 'png') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pageCount = pdf.getPageCount();
      
      const images = [];
      
      for (let i = 0; i < pageCount; i++) {
        const singlePagePdf = await PDFDocument.create();
        const [copiedPage] = await singlePagePdf.copyPages(pdf, [i]);
        singlePagePdf.addPage(copiedPage);
        
        const pdfBytes = await singlePagePdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        const page = copiedPage;
        const { width, height } = page.getSize();
        
        const scale = 2;
        canvas.width = width * scale;
        canvas.height = height * scale;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const imageBlob = await new Promise((resolve) => {
          canvas.toBlob((blob) => {
            resolve(blob);
          }, `image/${format}`, 0.95);
        });
        
        images.push({
          blob: imageBlob,
          filename: `page_${i + 1}.${format}`
        });
      }
      
      return images;
    } catch (error) {
      throw new Error(`Failed to convert PDF to images: ${error.message}`);
    }
  }

  async getPageCount(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      return pdf.getPageCount();
    } catch (error) {
      throw new Error(`Failed to read PDF: ${error.message}`);
    }
  }
}
