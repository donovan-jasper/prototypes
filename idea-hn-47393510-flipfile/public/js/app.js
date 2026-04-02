import ImageConverter from './converters/image-converter.js';
import MediaConverter from './converters/media-converter.js';
import ArchiveConverter from './converters/archive-converter.js';
import { UIManager } from './utils/ui-manager.js';
import { FileHandler } from './utils/file-handler.js';

class App {
  constructor() {
    this.uiManager = new UIManager();
    this.fileHandler = new FileHandler();
    this.imageConverter = new ImageConverter();
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
      fileList.classList.remove('has-files');
      fileList.innerHTML = '';
      return;
    }
    
    fileList.classList.add('has-files');
    fileList.innerHTML = '<h3>Selected Files:</h3>';
    
    this.selectedFiles.forEach((file, index) => {
      const fileItem = document.createElement('div');
      fileItem.className = 'file-item';
      fileItem.innerHTML = `
        <div class="file-info">
          <div class="file-name">${file.name}</div>
          <div class="file-size">${this.fileHandler.formatFileSize(file.size)}</div>
        </div>
        <button class="file-remove" data-index="${index}">×</button>
      `;
      
      fileItem.querySelector('.file-remove').addEventListener('click', () => {
        this.removeFile(index);
      });
      
      fileList.appendChild(fileItem);
    });
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    this.displayFileList();
  }

  async handleConvert() {
    if (this.selectedFiles.length === 0) {
      this.uiManager.showError('Please select files to convert');
      return;
    }
    
    const formatSelector = document.getElementById('formatSelector');
    const targetFormat = formatSelector.value;
    
    if (!targetFormat) {
      this.uiManager.showError('Please select a target format');
      return;
    }
    
    const file = this.selectedFiles[0];
    
    try {
      let result;
      
      if (this.currentTool === 'image') {
        const quality = document.getElementById('qualitySlider')?.value || 0.8;
        result = await this.imageConverter.convert(file, targetFormat, parseFloat(quality), this.uiManager, this.fileHandler);
      } else if (this.currentTool === 'media') {
        const options = {};
        const bitrateSlider = document.getElementById('bitrateSlider');
        if (bitrateSlider) {
          options.bitrate = bitrateSlider.value;
        }
        result = await this.mediaConverter.convert(file, targetFormat, options, this.uiManager, this.fileHandler);
      } else if (this.currentTool === 'archive') {
        result = await this.archiveConverter.createZip(this.selectedFiles, this.uiManager);
      }
      
      if (result) {
        this.uiManager.enableDownload(result.blob, result.filename);
        this.uiManager.showSuccess('Conversion completed successfully!');
      }
    } catch (error) {
      this.uiManager.showError(`Conversion failed: ${error.message}`);
    }
  }
}

const app = new App();
