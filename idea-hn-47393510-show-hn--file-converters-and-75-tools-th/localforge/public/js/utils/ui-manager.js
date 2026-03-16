class UIManager {
  static showProgress(percentage, message) {
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    progressContainer.style.display = 'block';
    progressBar.style.width = `${percentage}%`;
    progressText.textContent = `${message} (${percentage}%)`;
  }

  static showError(message) {
    alert(`Error: ${message}`);
    this.resetUI();
  }

  static showSuccess(message) {
    alert(`Success: ${message}`);
  }

  static updateToolOptions(toolType) {
    const optionsContainer = document.getElementById('conversionOptions');
    optionsContainer.innerHTML = '';

    switch (toolType) {
      case 'image':
        this.addImageOptions(optionsContainer);
        break;
      case 'pdf':
        this.addPDFOptions(optionsContainer);
        break;
      case 'media':
        this.addMediaOptions(optionsContainer);
        break;
      case 'document':
        this.addDocumentOptions(optionsContainer);
        break;
      case 'archive':
        this.addArchiveOptions(optionsContainer);
        break;
    }
  }

  static addImageOptions(container) {
    const formats = ['png', 'jpg', 'webp', 'gif', 'bmp'];

    const formatSelect = document.createElement('select');
    formatSelect.id = 'formatSelect';
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      formatSelect.appendChild(option);
    });

    const qualityLabel = document.createElement('label');
    qualityLabel.textContent = 'Quality:';
    qualityLabel.htmlFor = 'qualitySlider';

    const qualitySlider = document.createElement('input');
    qualitySlider.type = 'range';
    qualitySlider.id = 'qualitySlider';
    qualitySlider.min = '0.1';
    qualitySlider.max = '1';
    qualitySlider.step = '0.1';
    qualitySlider.value = '0.8';

    const qualityValue = document.createElement('span');
    qualityValue.id = 'qualityValue';
    qualityValue.textContent = '0.8';

    qualitySlider.addEventListener('input', () => {
      qualityValue.textContent = qualitySlider.value;
    });

    const convertButton = document.createElement('button');
    convertButton.id = 'convertButton';
    convertButton.textContent = 'Convert';

    container.appendChild(formatSelect);
    container.appendChild(document.createElement('br'));
    container.appendChild(qualityLabel);
    container.appendChild(qualitySlider);
    container.appendChild(qualityValue);
    container.appendChild(document.createElement('br'));
    container.appendChild(convertButton);
  }

  static addPDFOptions(container) {
    const actions = ['merge', 'split', 'compress', 'pdf-to-images'];

    const actionSelect = document.createElement('select');
    actionSelect.id = 'actionSelect';
    actions.forEach(action => {
      const option = document.createElement('option');
      option.value = action;
      option.textContent = action.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
      actionSelect.appendChild(option);
    });

    const convertButton = document.createElement('button');
    convertButton.id = 'convertButton';
    convertButton.textContent = 'Process';

    container.appendChild(actionSelect);
    container.appendChild(document.createElement('br'));
    container.appendChild(convertButton);
  }

  static addMediaOptions(container) {
    const formats = ['mp4', 'webm', 'mp3', 'wav', 'ogg'];

    const formatSelect = document.createElement('select');
    formatSelect.id = 'formatSelect';
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      formatSelect.appendChild(option);
    });

    const convertButton = document.createElement('button');
    convertButton.id = 'convertButton';
    convertButton.textContent = 'Convert';

    container.appendChild(formatSelect);
    container.appendChild(document.createElement('br'));
    container.appendChild(convertButton);
  }

  static addDocumentOptions(container) {
    const formats = ['txt', 'md', 'html', 'csv', 'json'];

    const formatSelect = document.createElement('select');
    formatSelect.id = 'formatSelect';
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format;
      option.textContent = format.toUpperCase();
      formatSelect.appendChild(option);
    });

    const convertButton = document.createElement('button');
    convertButton.id = 'convertButton';
    convertButton.textContent = 'Convert';

    container.appendChild(formatSelect);
    container.appendChild(document.createElement('br'));
    container.appendChild(convertButton);
  }

  static addArchiveOptions(container) {
    const actions = ['create', 'extract'];

    const actionSelect = document.createElement('select');
    actionSelect.id = 'actionSelect';
    actions.forEach(action => {
      const option = document.createElement('option');
      option.value = action;
      option.textContent = action.replace(/\b\w/g, l => l.toUpperCase());
      actionSelect.appendChild(option);
    });

    const convertButton = document.createElement('button');
    convertButton.id = 'convertButton';
    convertButton.textContent = 'Process';

    container.appendChild(actionSelect);
    container.appendChild(document.createElement('br'));
    container.appendChild(convertButton);
  }

  static enableDownload(blob, filename) {
    const downloadButton = document.getElementById('downloadButton');
    downloadButton.disabled = false;

    downloadButton.onclick = () => {
      fileHandler.downloadFile(blob, filename);
      this.resetUI();
    };
  }

  static resetUI() {
    document.getElementById('progressContainer').style.display = 'none';
    document.getElementById('downloadButton').disabled = true;
    document.getElementById('fileInput').value = '';
  }
}
