class UIManager {
  constructor() {
    this.progressElement = document.getElementById('progress');
    this.errorElement = document.getElementById('error');
    this.successElement = document.getElementById('success');
    this.downloadButton = document.getElementById('download-button');
  }

  showProgress(percentage, message) {
    this.progressElement.style.display = 'block';
    this.progressElement.innerHTML = `${message} (${percentage}%)`;
  }

  showError(message) {
    this.errorElement.style.display = 'block';
    this.errorElement.innerHTML = message;
  }

  showSuccess(message) {
    this.successElement.style.display = 'block';
    this.successElement.innerHTML = message;
  }

  enableDownload(blob, filename) {
    this.downloadButton.style.display = 'block';
    this.downloadButton.href = URL.createObjectURL(blob);
    this.downloadButton.download = filename;
  }

  resetUI() {
    this.progressElement.style.display = 'none';
    this.errorElement.style.display = 'none';
    this.successElement.style.display = 'none';
    this.downloadButton.style.display = 'none';
  }
}

export { UIManager };
