class ImageConverter {
  static async convert(file) {
    try {
      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/bmp'];
      fileHandler.validateFile(file, allowedTypes);

      // Get conversion options
      const targetFormat = document.getElementById('formatSelect').value;
      const quality = parseFloat(document.getElementById('qualitySlider').value);

      // Read file as array buffer
      const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);

      // Convert image
      const blob = await this.convertImage(arrayBuffer, targetFormat, quality);

      // Generate filename
      const originalName = file.name.split('.').slice(0, -1).join('.');
      const filename = `${originalName}.${targetFormat}`;

      return { blob, filename };
    } catch (error) {
      UIManager.showError(error.message);
      throw error;
    }
  }

  static async convertImage(arrayBuffer, targetFormat, quality) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Set canvas dimensions
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw image to canvas
        ctx.drawImage(image, 0, 0);

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            resolve(blob);
          },
          `image/${targetFormat}`,
          quality
        );
      };
      image.onerror = () => reject(new Error('Failed to load image'));
      image.src = URL.createObjectURL(new Blob([arrayBuffer]));
    });
  }
}
