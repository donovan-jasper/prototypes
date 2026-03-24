importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js');

let ffmpeg;

self.onmessage = async function(e) {
  const { type, data, originalFilename, targetFormat } = e.data;

  if (type === 'init') {
    try {
      if (!ffmpeg) {
        self.postMessage({ type: 'status', message: 'Loading FFmpeg...' });
        ffmpeg = FFmpeg.createFFmpeg({ log: true });
        await ffmpeg.load();
        self.postMessage({ type: 'ready' });
      }
    } catch (error) {
      self.postMessage({ type: 'error', message: `Failed to initialize FFmpeg: ${error.message}` });
    }
  } else if (type === 'convert') {
    try {
      const inputName = 'input';
      const outputName = 'output.' + targetFormat;
      
      // Write input file to virtual filesystem
      ffmpeg.FS('writeFile', inputName, new Uint8Array(data));
      
      // Set up progress callback
      ffmpeg.setProgress(({ ratio }) => {
        const progress = Math.round(ratio * 100);
        self.postMessage({
          type: 'progress',
          progress: progress,
          message: `Processing... ${progress}%`
        });
      });
      
      // Determine the correct FFmpeg command based on conversion type
      let commandArgs;
      if (targetFormat === 'mp3') {
        commandArgs = ['-i', inputName, '-vn', '-acodec', 'mp3', outputName];
      } else if (targetFormat === 'wav') {
        commandArgs = ['-i', inputName, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', outputName];
      } else if (targetFormat === 'ogg') {
        commandArgs = ['-i', inputName, '-vn', '-acodec', 'libvorbis', outputName];
      } else if (targetFormat === 'mp4') {
        commandArgs = ['-i', inputName, '-c:v', 'libx264', '-c:a', 'aac', outputName];
      } else if (targetFormat === 'webm') {
        commandArgs = ['-i', inputName, '-c:v', 'libvpx-vp9', '-c:a', 'libopus', outputName];
      } else {
        throw new Error(`Unsupported target format: ${targetFormat}`);
      }
      
      // Execute FFmpeg command
      await ffmpeg.run(...commandArgs);
      
      // Read output file from virtual filesystem
      const outputData = ffmpeg.FS('readFile', outputName);
      
      // Clean up input file
      ffmpeg.FS('unlink', inputName);
      ffmpeg.FS('unlink', outputName);
      
      // Determine MIME type based on target format
      let mimeType;
      switch(targetFormat) {
        case 'mp3':
          mimeType = 'audio/mpeg';
          break;
        case 'wav':
          mimeType = 'audio/wav';
          break;
        case 'ogg':
          mimeType = 'audio/ogg';
          break;
        case 'mp4':
          mimeType = 'video/mp4';
          break;
        case 'webm':
          mimeType = 'video/webm';
          break;
        default:
          mimeType = 'application/octet-stream';
      }
      
      // Send result back to main thread
      self.postMessage({
        type: 'result',
        data: outputData.buffer,
        mime: mimeType,
        filename: originalFilename.replace(/\.[^/.]+$/, '') + '.' + targetFormat
      });
    } catch (error) {
      self.postMessage({ type: 'error', message: `Conversion failed: ${error.message}` });
    }
  }
};
