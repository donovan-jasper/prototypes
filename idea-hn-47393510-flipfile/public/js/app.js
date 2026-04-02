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
  }

  async handleFileDrop(event) {
    const files = event.dataTransfer.files;
    const file = files[0];
    const targetFormat = 'jpg'; // Example target format

    try {
      const result = await this.imageConverter.convert(file, targetFormat, 0.8, this.uiManager, this.fileHandler);
      this.uiManager.enableDownload(result.blob, result.filename);
    } catch (error) {
      this.uiManager.showError(`Conversion failed: ${error.message}`);
    }
  }

  async handleMediaConversion(file, targetFormat) {
    try {
      const result = await this.mediaConverter.convert(file, targetFormat, null, this.uiManager, this.fileHandler);
      this.uiManager.enableDownload(result.blob, result.filename);
    } catch (error) {
      this.uiManager.showError(`Conversion failed: ${error.message}`);
    }
  }

  async handleArchiveCreation(files) {
    try {
      const result = await this.archiveConverter.createZip(files, this.uiManager);
      this.uiManager.enableDownload(result.blob, result.filename);
    } catch (error) {
      this.uiManager.showError(`ZIP creation failed: ${error.message}`);
    }
  }
}

const app = new App();

// Example usage
const fileInput = document.getElementById('file-input');
fileInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  app.handleFileDrop({ dataTransfer: { files: [file] } });
});

const mediaConversionButton = document.getElementById('media-conversion-button');
mediaConversionButton.addEventListener('click', () => {
  const file = document.getElementById('media-file-input').files[0];
  const targetFormat = 'mp3'; // Example target format
  app.handleMediaConversion(file, targetFormat);
});

const archiveCreationButton = document.getElementById('archive-creation-button');
archiveCreationButton.addEventListener('click', () => {
  const files = document.getElementById('archive-file-input').files;
  app.handleArchiveCreation(files);
});
