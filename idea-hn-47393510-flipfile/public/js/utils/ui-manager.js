class UIManager {
  constructor() {}

  showProgress(percentage, message) {
    const progressElement = document.getElementById('progress');
    progressElement.style.width = `${percentage}%`;
    progressElement.textContent = message;
  }

  showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
  }

  showSuccess(message) {
    const successElement = document.getElementById('success');
    successElement.textContent = message;
  }

  enableDownload(blob, filename) {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.href = URL.createObjectURL(blob);
    downloadButton.download = filename;
    downloadButton.style.display = 'block';
  }

  resetUI() {
    const progressElement = document.getElementById('progress');
    progressElement.style.width = '0%';
    progressElement.textContent = '';
    const errorElement = document.getElementById('error');
    errorElement.textContent = '';
    const successElement = document.getElementById('success');
    successElement.textContent = '';
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.style.display = 'none';
  }

  updateToolOptions(toolType) {
    const conversionOptionsElement = document.getElementById('conversionOptions');
    conversionOptionsElement.innerHTML = '';
    if (toolType === 'media') {
      const label = document.createElement('label');
      label.textContent = 'Target Format:';
      const select = document.createElement('select');
      select.id = 'targetFormat';
      const options = [
        { value: 'mp4', text: 'MP4' },
        { value: 'webm', text: 'WebM' },
        { value: 'mp3', text: 'MP3' },
        { value: 'wav', text: 'WAV' },
        { value: 'ogg', text: 'OGG' },
      ];
      options.forEach((option) => {
        const optionElement = document.createElement('option');
        optionElement.value = option.value;
        optionElement.textContent = option.text;
        select.appendChild(optionElement);
      });
      conversionOptionsElement.appendChild(label);
      conversionOptionsElement.appendChild(select);
      const convertButton = document.createElement('button');
      convertButton.id = 'convertButton';
      convertButton.textContent = 'Convert';
      conversionOptionsElement.appendChild(convertButton);
    }
  }

  getMediaConversionOptions() {
    const select = document.getElementById('targetFormat');
    return select.value;
  }
}

export default UIManager;
