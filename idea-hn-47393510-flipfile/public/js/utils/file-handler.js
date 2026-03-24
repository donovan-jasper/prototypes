class FileHandler {
  constructor(uiManager, ffmpegWorker) {
    this.uiManager = uiManager;
    this.ffmpegWorker = ffmpegWorker;
  }

  handleFileDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    this.convertFiles([file], 'media');
  }

  handleFileSelect(event) {
    const file = event.target.files[0];
    this.convertFiles([file], 'media');
  }

  validateFile(file, allowedTypes) {
    const fileType = file.type;
    return allowedTypes.includes(fileType);
  }

  readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result);
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  formatFileSize(bytes) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let index = 0;
    while (bytes >= 1024 && index < units.length - 1) {
      bytes /= 1024;
      index++;
    }
    return `${bytes.toFixed(2)} ${units[index]}`;
  }

  convertFiles(files, toolType) {
    if (toolType === 'media') {
      const targetFormat = this.uiManager.getMediaConversionOptions();
      MediaConverter.convert(files[0], targetFormat, this.ffmpegWorker, this.uiManager, this).then((blob, filename) => {
        this.uiManager.enableDownload(blob, filename);
        this.uiManager.showSuccess('Conversion complete!');
      }).catch((error) => {
        this.uiManager.showError(error);
      });
    }
  }
}

export default FileHandler;
