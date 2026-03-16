class FileHandler {
  constructor() {
    this.fileInput = document.getElementById('fileInput');
    this.dropZone = document.getElementById('dropZone');
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.dropZone.addEventListener('click', () => this.fileInput.click());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
    this.dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.dropZone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
    this.dropZone.addEventListener('drop', (e) => this.handleFileDrop(e));
  }

  handleFileSelect(event) {
    const files = event.target.files;
    this.processFiles(files);
  }

  handleFileDrop(event) {
    event.preventDefault();
    this.dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;
    this.processFiles(files);
  }

  handleDragOver(event) {
    event.preventDefault();
    this.dropZone.classList.add('dragover');
  }

  handleDragLeave(event) {
    event.preventDefault();
    this.dropZone.classList.remove('dragover');
  }

  processFiles(files) {
    if (files.length === 0) return;

    // Process files based on current tool
    const currentTool = document.querySelector('.sidebar nav a.active')?.dataset.tool;
    if (!currentTool) {
      UIManager.showError('Please select a tool first');
      return;
    }

    // Convert files to array and pass to appropriate converter
    const fileArray = Array.from(files);
    this.convertFiles(fileArray, currentTool);
  }

  async convertFiles(files, toolType) {
    try {
      let result;
      switch (toolType) {
        case 'image':
          result = await ImageConverter.convert(files[0]);
          break;
        case 'pdf':
          result = await PDFConverter.convert(files);
          break;
        case 'media':
          result = await MediaConverter.convert(files[0]);
          break;
        case 'document':
          result = await DocumentConverter.convert(files[0]);
          break;
        case 'archive':
          result = await ArchiveConverter.convert(files);
          break;
        default:
          throw new Error('Invalid tool type');
      }

      if (result) {
        UIManager.enableDownload(result.blob, result.filename);
      }
    } catch (error) {
      UIManager.showError(error.message);
    }
  }

  validateFile(file, allowedTypes) {
    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not supported. Allowed types: ${allowedTypes.join(', ')}`);
    }

    if (file.size > 100 * 1024 * 1024) { // 100MB limit
      throw new Error('File size exceeds 100MB limit');
    }

    return true;
  }

  async readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsArrayBuffer(file);
    });
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

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

const fileHandler = new FileHandler();
fileHandler.init();
