import ImageConverter from './converters/image-converter.js';
import PDFConverter from './converters/pdf-converter.js';
import MediaConverter from './converters/media-converter.js';
import ArchiveConverter from './converters/archive-converter.js';
import { UIManager } from './utils/ui-manager.js';
import { FileHandler } from './utils/file-handler.js';

class App {
  constructor() {
    this.uiManager = new UIManager();
    this.fileHandler = new FileHandler();
    this.imageConverter = new ImageConverter();
    this.pdfConverter = new PDFConverter();
    this.mediaConverter = new MediaConverter();
    this.archiveConverter = new ArchiveConverter();
    this.selectedFiles = [];
    this.currentTool = 'image';
    
    this.formatsByTool = {
      image: ['jpg', 'png', 'webp', 'gif', 'bmp'],
      media: ['mp4', 'webm', 'mp3', 'wav', 'ogg'],
      pdf: ['merge', 'split', 'compress', 'to-images'],
      document: ['txt', 'md', 'html', 'csv', 'json'],
      archive: ['zip']
    };
    
    this.init();
  }

  init() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const convertButton = document.getElementById('convertButton');
    const formatSelector = document.getElementById('formatSelector');
    
    dropZone.addEventListener('click', () => fileInput.click());
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('drag-over');
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      this.handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
      this.handleFiles(e.target.files);
    });
    
    convertButton.addEventListener('click', () => this.handleConvert());
    
    formatSelector.addEventListener('change', (e) => {
      this.updateQualityOptions(e.target.value);
    });
    
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const tool = e.target.dataset.tool;
        this.switchTool(tool);
      });
    });
    
    this.updateFormatSelector();
  }

  switchTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll('nav a').forEach(link => {
      link.classList.remove('active');
    });
    document.querySelector(`[data-tool="${tool}"]`).classList.add('active');
    this.updateFormatSelector();
    this.selectedFiles = [];
    this.displayFileList();
  }

  updateFormatSelector() {
    const formatSelector = document.getElementById('formatSelector');
    const formats = this.formatsByTool[this.currentTool] || [];
    
    formatSelector.innerHTML = '<option value="">Select format...</option>';
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      formatSelector.appendChild(option);
    });
    
    document.getElementById('qualityOptions').classList.remove('visible');
  }

  updateQualityOptions(format) {
    const qualityOptions = document.getElementById('qualityOptions');
    qualityOptions.innerHTML = '';
    
    if (this.currentTool === 'image' && ['jpg', 'webp'].includes(format)) {
      qualityOptions.innerHTML = `
        <div class="option-group">
          <label for="qualitySlider">Quality</label>
          <input type="range" id="qualitySlider" min="0.1" max="1" step="0.1" value="0.8">
          <div class="option-value">Quality: <span id="qualityValue">0.8</span></div>
        </div>
      `;
      
      const slider = document.getElementById('qualitySlider');
      const valueDisplay = document.getElementById('qualityValue');
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
      });
      
      qualityOptions.classList.add('visible');
    } else if (this.currentTool === 'media' && ['mp3', 'wav', 'ogg'].includes(format)) {
      qualityOptions.innerHTML = `
        <div class="option-group">
          <label for="bitrateSlider">Bitrate (kbps)</label>
          <input type="range" id="bitrateSlider" min="64" max="320" step="32" value="192">
          <div class="option-value">Bitrate: <span id="bitrateValue">192</span> kbps</div>
        </div>
      `;
      
      const slider = document.getElementById('bitrateSlider');
      const valueDisplay = document.getElementById('bitrateValue');
      slider.addEventListener('input', (e) => {
        valueDisplay.textContent = e.target.value;
      });
      
      qualityOptions.classList.add('visible');
    } else if (this.currentTool === 'pdf' && format === 'split') {
      qualityOptions.innerHTML = `
        <div class="option-group">
          <label for="pageRanges">Page Ranges (e.g., 1-3,5,7-9)</label>
          <input type="text" id="pageRanges" placeholder="1-3,5,7-9">
        </div>
      `;
      qualityOptions.classList.add('visible');
    } else if (this.currentTool === 'pdf' && format === 'to-images') {
      qualityOptions.innerHTML = `
        <div class="option-group">
          <label for="imageFormat">Image Format</label>
          <select id="imageFormat">
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </div>
      `;
      qualityOptions.classList.add('visible');
    } else {
      qualityOptions.classList.remove('visible');
    }
  }

  handleFiles(files) {
    this.selectedFiles = Array.from(files);
    this.displayFileList();
  }

  displayFileList() {
    const fileList = document.getElementById('fileList');
    
    if (this.selectedFiles.length === 0) {
      fileList.innerHTML = '<p class="no-files">No files selected</p>';
      return;
    }
    
    fileList.innerHTML = '<ul class="file-items">' + 
      this.selectedFiles.map(file => `
        <li class="file-item">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${this.formatFileSize(file.size)}</span>
        </li>
      `).join('') +
      '</ul>';
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  async handleConvert() {
    const format = document.getElementById('formatSelector').value;
    
    if (!format) {
      this.uiManager.showError('Please select a format');
      return;
    }
    
    if (this.selectedFiles.length === 0) {
      this.uiManager.showError('Please select files to convert');
      return;
    }
    
    try {
      this.uiManager.showProgress(0, 'Starting conversion...');
      
      let result;
      
      switch (this.currentTool) {
        case 'image':
          result = await this.convertImage(format);
          break;
        case 'media':
          result = await this.convertMedia(format);
          break;
        case 'pdf':
          result = await this.convertPDF(format);
          break;
        case 'archive':
          result = await this.convertArchive(format);
          break;
        default:
          throw new Error('Unsupported tool');
      }
      
      this.uiManager.showProgress(100, 'Conversion complete!');
      
      if (Array.isArray(result)) {
        result.forEach(({ blob, filename }) => {
          this.downloadFile(blob, filename);
        });
      } else {
        this.downloadFile(result.blob, result.filename);
      }
      
      this.uiManager.showSuccess('Conversion completed successfully!');
    } catch (error) {
      console.error('Conversion error:', error);
      this.uiManager.showError(error.message);
    }
  }

  async convertImage(format) {
    const file = this.selectedFiles[0];
    const quality = document.getElementById('qualitySlider')?.value || 0.8;
    
    const blob = await this.imageConverter.convert(file, format, parseFloat(quality));
    const filename = file.name.replace(/\.[^.]+$/, `.${format}`);
    
    return { blob, filename };
  }

  async convertMedia(format) {
    const file = this.selectedFiles[0];
    const bitrate = document.getElementById('bitrateSlider')?.value || 192;
    
    const blob = await this.mediaConverter.convert(file, format, { bitrate });
    const filename = file.name.replace(/\.[^.]+$/, `.${format}`);
    
    return { blob, filename };
  }

  async convertPDF(format) {
    const file = this.selectedFiles[0];
    
    switch (format) {
      case 'merge':
        if (this.selectedFiles.length < 2) {
          throw new Error('Please select at least 2 PDF files to merge');
        }
        const mergedBlob = await this.pdfConverter.mergePDFs(this.selectedFiles);
        return { blob: mergedBlob, filename: 'merged.pdf' };
        
      case 'split':
        const pageRanges = document.getElementById('pageRanges')?.value;
        if (!pageRanges) {
          throw new Error('Please enter page ranges');
        }
        const splitBlob = await this.pdfConverter.splitPDF(file, pageRanges);
        return { blob: splitBlob, filename: file.name.replace('.pdf', '_split.pdf') };
        
      case 'compress':
        const compressedBlob = await this.pdfConverter.compressPDF(file);
        return { blob: compressedBlob, filename: file.name.replace('.pdf', '_compressed.pdf') };
        
      case 'to-images':
        const imageFormat = document.getElementById('imageFormat')?.value || 'png';
        const images = await this.pdfConverter.pdfToImages(file, imageFormat);
        return images;
        
      default:
        throw new Error('Unsupported PDF operation');
    }
  }

  async convertArchive(format) {
    if (format === 'zip') {
      const blob = await this.archiveConverter.createZip(this.selectedFiles);
      return { blob, filename: 'archive.zip' };
    }
    throw new Error('Unsupported archive format');
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

const app = new App();
