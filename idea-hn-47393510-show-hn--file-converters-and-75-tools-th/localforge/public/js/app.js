document.addEventListener('DOMContentLoaded', () => {
  // Initialize UI manager
  const uiManager = new UIManager();

  // Set up tool selection
  const toolLinks = document.querySelectorAll('.sidebar nav a');
  toolLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      toolLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      uiManager.updateToolOptions(link.dataset.tool);
    });
  });

  // Set default tool
  toolLinks[0].click();

  // Initialize file handler
  const fileHandler = new FileHandler();

  // Set up convert button
  document.addEventListener('click', (e) => {
    if (e.target.id === 'convertButton') {
      fileHandler.processFiles(fileHandler.fileInput.files);
    }
  });

  // Initialize FFmpeg worker
  const ffmpegWorker = new Worker('workers/ffmpeg-worker.js');
  ffmpegWorker.postMessage({ type: 'init' });

  // Handle worker messages
  ffmpegWorker.onmessage = (event) => {
    const { type, data } = event.data;

    switch (type) {
      case 'progress':
        uiManager.showProgress(data.percentage, 'Converting...');
        break;
      case 'result':
        uiManager.enableDownload(data.blob, data.filename);
        break;
      case 'error':
        uiManager.showError(data.message);
        break;
    }
  };
});
