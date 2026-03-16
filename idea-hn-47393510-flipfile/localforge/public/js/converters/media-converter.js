const { createFFmpeg, fetchFile } = require('@ffmpeg/ffmpeg');

class MediaConverter {
  static async convert(file) {
    try {
      // Validate file type
      const allowedTypes = [
        'video/mp4', 'video/webm',
        'audio/mp3', 'audio/wav', 'audio/ogg'
      ];
      fileHandler.validateFile(file, allowedTypes);

      // Get conversion options
      const targetFormat = document.getElementById('formatSelect').value;

      // Initialize FFmpeg
      const ffmpeg = createFFmpeg({ log: true });
      if (!ffmpeg.isLoaded()) {
        UIManager.showProgress(0, 'Loading FFmpeg...');
        await ffmpeg.load();
      }

      // Read file as array buffer
      const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);

      // Convert media
      const result = await this.convertMedia(ffmpeg, arrayBuffer, file.name, targetFormat);

      return result;
    } catch (error) {
      UIManager.showError(error.message);
      throw error;
    }
  }

  static async convertMedia(ffmpeg, arrayBuffer, filename, targetFormat) {
    return new Promise(async (resolve, reject) => {
      try {
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
          UIManager.showProgress(percentage, 'Converting...');
        });

        await ffmpeg.run(...command);

        // Read output file
        const data = ffmpeg.FS('readFile', outputName);

        // Create blob and clean up
        const blob = new Blob([data.buffer], { type: `video/${targetFormat}` });
        ffmpeg.FS('unlink', inputName);
        ffmpeg.FS('unlink', outputName);

        resolve({ blob, filename: `converted.${targetFormat}` });
      } catch (error) {
        reject(error);
      }
    });
  }
}
