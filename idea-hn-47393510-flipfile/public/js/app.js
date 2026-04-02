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
    }
  }

  handleFiles(files) {
    this.selectedFiles = Array.from(files);
    this.displayFileList();
  }

  displayFileList() {
    const fileList = document.getElementById('fileList');
    
    if (this.selectedFiles.length === 0) {
      fileList.innerHTML = '<p>No files selected</p>';
      return;
    }
    
    fileList.innerHTML = '<ul>' + 
      this.selectedFiles.map(file => 
        `<li>${file.name} (${this.fileHandler.formatFileSize(file.size)})</li>`
      ).join('') + 
      '</ul>';
  }

  async handleConvert() {
    if (this.selectedFiles.length === 0) {
      this.uiManager.showError('Please select a file first');
      return;
    }

    const formatSelector = document.getElementById('formatSelector');
    const targetFormat = formatSelector.value;
    
    if (!targetFormat) {
      this.uiManager.showError('Please select a target format');
      return;
    }

    this.uiManager.resetUI();

    try {
      if (this.currentTool === 'image') {
        await this.convertImage(targetFormat);
      } else if (this.currentTool === 'media') {
        await this.convertMedia(targetFormat);
      } else if (this.currentTool === 'pdf') {
        await this.convertPDF(targetFormat);
      } else if (this.currentTool === 'document') {
        await this.convertDocument(targetFormat);
      } else if (this.currentTool === 'archive') {
        await this.createArchive(targetFormat);
      }
    } catch (error) {
      console.error('Conversion error:', error);
    }
  }

  async convertImage(targetFormat) {
    const file = this.selectedFiles[0];
    const qualitySlider = document.getElementById('qualitySlider');
    const quality = qualitySlider ? parseFloat(qualitySlider.value) : 0.8;

    const result = await ImageConverter.convert(
      file,
      targetFormat,
      quality,
      this.uiManager,
      this.fileHandler
    );

    this.uiManager.enableDownload(result.blob, result.filename);
  }

  async convertMedia(targetFormat) {
    this.uiManager.showError('Media conversion not yet implemented');
  }

  async convertPDF(targetFormat) {
    this.uiManager.showError('PDF conversion not yet implemented');
  }

  async convertDocument(targetFormat) {
    this.uiManager.showError('Document conversion not yet implemented');
  }

  async createArchive(targetFormat) {
    this.uiManager.showError('Archive creation not yet implemented');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new App();
});
