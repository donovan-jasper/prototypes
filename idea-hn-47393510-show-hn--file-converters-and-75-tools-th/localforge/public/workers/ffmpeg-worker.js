importScripts('https://unpkg.com/@ffmpeg/ffmpeg@0.11.6/dist/ffmpeg.min.js');

const { createFFmpeg, fetchFile } = FFmpeg;

let ffmpeg;

self.onmessage = async (event) => {
  const { type, data } = event.data;

  switch (type) {
    case 'init':
      ffmpeg = createFFmpeg({ log: true });
      if (!ffmpeg.isLoaded()) {
        await ffmpeg.load();
        postMessage({ type: 'init', status: 'ready' });
      }
      break;

    case 'convert':
      try {
        const { arrayBuffer, filename, targetFormat } = data;

        // Write input file to FFmpeg's virtual file system
        const inputName = `input.${filename.split('.').pop()}`;
        ffmpeg.FS('writeFile', inputName, await fetchFile(arrayBuffer));

        // Set output filename
        const outputName = `output.${targetFormat}`;

        // Set FFmpeg command based on input and output formats
        let command = [];
        if (targetFormat === 'mp3' || targetFormat === 'wav' || targetFormat === 'ogg') {
          // Audio conversion
          command = [
            '-i', inputName,
            '-vn', // Disable video
            '-acodec', 'libmp3lame', // Use MP3 codec
            '-q:a', '2', // Quality level (0-9, lower is better)
            outputName
          ];
        } else {
          // Video conversion
          command = [
            '-i', inputName,
            '-c:v', 'libvpx-vp9', // Use VP9 codec for WebM
            '-crf', '30', // Quality level (0-63, lower is better)
            '-b:v', '0', // Let CRF control bitrate
            '-c:a', 'libopus', // Use Opus codec for audio
            outputName
          ];
        }

        // Run FFmpeg command
        ffmpeg.setProgress(({ ratio }) => {
          const percentage = Math.round(ratio * 100);
          postMessage({ type: 'progress', percentage });
        });

        await ffmpeg.run(...command);

        // Read output file
        const outputData = ffmpeg.FS('readFile', outputName);

        // Clean up
        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);

        postMessage({
          type: 'result',
          data: {
            blob: new Blob([outputData.buffer], { type: `video/${targetFormat}` }),
            filename: `converted.${targetFormat}`
          }
        });
      } catch (error) {
        postMessage({ type: 'error', message: error.message });
      }
      break;
  }
};
