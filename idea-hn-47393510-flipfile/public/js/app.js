let selectedToolType = 'media';

document.addEventListener('DOMContentLoaded', () => {
  const uiManager = new UIManager();
  const fileHandler = new FileHandler(uiManager, new Worker('workers/ffmpeg-worker.js'));
  const ffmpegWorker = new Worker('workers/ffmpeg-worker.js');
  uiManager.updateToolOptions(selectedToolType);

  // Add event listeners to the sidebar navigation links
  const sidebarLinks = document.querySelectorAll('a[data-tool]');
  sidebarLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      const toolType = link.getAttribute('data-tool');
      selectedToolType = toolType;
      uiManager.updateToolOptions(toolType);
    });
  });

  document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const targetFormat = uiManager.getMediaConversionOptions();
    fileHandler.convertFiles([file], selectedToolType).then((blob, filename) => {
      console.log('Conversion complete!');
    }).catch((error) => {
      console.error('Error:', error);
    });
  });
});
