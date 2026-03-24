class MediaConverter {
  static convert(file, targetFormat, ffmpegWorkerInstance, uiManagerInstance, fileHandlerInstance) {
    return new Promise((resolve, reject) => {
      uiManagerInstance.showProgress(0, 'Converting...');
      fileHandlerInstance.readFileAsArrayBuffer(file).then((arrayBuffer) => {
        const originalFilename = file.name;
        const message = {
          type: 'convert',
          data: arrayBuffer,
          originalFilename,
          targetFormat,
        };
        ffmpegWorkerInstance.postMessage(message);
        ffmpegWorkerInstance.onmessage = (event) => {
          if (event.data.type === 'progress') {
            uiManagerInstance.showProgress(event.data.progress, event.data.message);
          } else if (event.data.type === 'result') {
            const blob = new Blob([event.data.data], { type: event.data.mime });
            const filename = event.data.filename;
            uiManagerInstance.enableDownload(blob, filename);
            uiManagerInstance.showSuccess('Conversion complete!');
            resolve(blob, filename);
          } else if (event.data.type === 'error') {
            uiManagerInstance.showError(event.data.message);
            reject(event.data.message);
          }
        };
      });
    });
  }
}

export default MediaConverter;
