document.addEventListener('DOMContentLoaded', () => {
  const uiManager = new UIManager();
  const fileHandler = new FileHandler(uiManager, new Worker('workers/ffmpeg-worker.js'));
  const ffmpegWorker = new Worker('workers/ffmpeg-worker.js');
  uiManager.updateToolOptions('media');
  document.getElementById('convertButton').addEventListener('click', () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];
    const targetFormat = uiManager.getMediaConversionOptions();
    MediaConverter.convert(file, targetFormat, ffmpegWorker, uiManager, fileHandler).then((blob, filename) => {
      console.log('Conversion complete!');
    }).catch((error) => {
      console.error('Error:', error);
    });
  });
});
