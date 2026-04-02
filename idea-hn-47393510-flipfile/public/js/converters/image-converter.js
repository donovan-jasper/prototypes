class ImageConverter {
  static async convert(file, targetFormat, quality, uiManager, fileHandler) {
    uiManager.showProgress(0, 'Loading image...');
    
    try {
      const arrayBuffer = await fileHandler.readFileAsArrayBuffer(file);
      const image = await this.loadImage(arrayBuffer);
      
      uiManager.showProgress(50, 'Processing image...');
      
      // Create canvas and draw image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match image
      canvas.width = image.width;
      canvas.height = image.height;
      
      // Draw image to canvas
      ctx.drawImage(image, 0, 0);
      
      uiManager.showProgress(80, 'Exporting image...');
      
      // Convert canvas to blob in target format
      const blob = await this.canvasToBlob(canvas, targetFormat, quality);
      
      // Generate output filename
      const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
      const filename = `${baseName}.${targetFormat}`;
      
      uiManager.showProgress(100, 'Complete!');
      uiManager.showSuccess('Conversion complete!');
      
      return { blob, filename };
    } catch (error) {
      uiManager.showError(`Image conversion failed: ${error.message}`);
      throw error;
    }
  }

  static loadImage(arrayBuffer) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([arrayBuffer]);
      const url = URL.createObjectURL(blob);
      const img = new Image();
      
      img.onload = () => {
        URL.revokeObjectURL(url); // Clean up
        resolve(img);
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url); // Clean up
        reject(new Error('Failed to load image'));
      };
      
      img.src = url;
    });
  }

  static drawToCanvas(image, maxWidth, maxHeight) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Calculate new dimensions maintaining aspect ratio
    let width = image.width;
    let height = image.height;
    
    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
    
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }
    
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(image, 0, 0, width, height);
    
    return canvas;
  }

  static canvasToBlob(canvas, format, quality) {
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        `image/${format}`,
        quality
      );
    });
  }
}

export default ImageConverter;
