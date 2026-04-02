export class UIManager {
  showProgress(percentage, message) {
    const progressBar = document.getElementById('progress');
    progressBar.style.width = `${percentage}%`;
    
    if (message) {
      console.log(message);
    }
  }

  showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.classList.add('visible');
    
    setTimeout(() => {
      errorDiv.classList.remove('visible');
    }, 5000);
  }

  showSuccess(message) {
    const successDiv = document.getElementById('success');
    successDiv.textContent = message;
    successDiv.classList.add('visible');
    
    setTimeout(() => {
      successDiv.classList.remove('visible');
    }, 5000);
  }

  updateToolOptions(toolType) {
    const optionsDiv = document.getElementById('conversion-options');
    optionsDiv.style.display = 'block';
  }

  enableDownload(blob, filename) {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.style.display = 'block';
    downloadButton.href = URL.createObjectURL(blob);
    downloadButton.download = filename;
    downloadButton.textContent = `Download ${filename}`;
  }

  resetUI() {
    document.getElementById('progress').style.width = '0%';
    document.getElementById('downloadButton').style.display = 'none';
    document.getElementById('error').classList.remove('visible');
    document.getElementById('success').classList.remove('visible');
  }
}
