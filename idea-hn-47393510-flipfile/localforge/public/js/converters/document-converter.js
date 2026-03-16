class DocumentConverter {
  static async convert(file) {
    try {
      // Validate file type
      const allowedTypes = [
        'text/plain', 'text/markdown',
        'text/html', 'text/csv', 'application/json'
      ];
      fileHandler.validateFile(file, allowedTypes);

      // Get conversion options
      const targetFormat = document.getElementById('formatSelect').value;

      // Read file as text
      const text = await this.readFileAsText(file);

      // Convert document
      const result = await this.convertDocument(text, file.type, targetFormat);

      return result;
    } catch (error) {
      UIManager.showError(error.message);
      throw error;
    }
  }

  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  static async convertDocument(text, sourceType, targetFormat) {
    let convertedContent;
    let mimeType;

    switch (targetFormat) {
      case 'txt':
        convertedContent = this.textToText(text, sourceType);
        mimeType = 'text/plain';
        break;
      case 'md':
        convertedContent = this.textToMarkdown(text, sourceType);
        mimeType = 'text/markdown';
        break;
      case 'html':
        convertedContent = this.textToHTML(text, sourceType);
        mimeType = 'text/html';
        break;
      case 'csv':
        convertedContent = this.textToCSV(text, sourceType);
        mimeType = 'text/csv';
        break;
      case 'json':
        convertedContent = this.textToJSON(text, sourceType);
        mimeType = 'application/json';
        break;
      default:
        throw new Error('Unsupported target format');
    }

    const blob = new Blob([convertedContent], { type: mimeType });
    const filename = `converted.${targetFormat}`;

    return { blob, filename };
  }

  static textToText(text, sourceType) {
    // Simple pass-through for text formats
    return text;
  }

  static textToMarkdown(text, sourceType) {
    // Convert HTML to Markdown
    if (sourceType === 'text/html') {
      // This is a simplified version. In a real implementation,
      // you would use a library like Turndown to properly convert HTML to Markdown.
      return text.replace(/<h1>(.*?)<\/h1>/g, '# $1\n')
                .replace(/<h2>(.*?)<\/h2>/g, '## $1\n')
                .replace(/<h3>(.*?)<\/h3>/g, '### $1\n')
                .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
                .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
                .replace(/<em>(.*?)<\/em>/g, '*$1*')
                .replace(/<ul>/g, '')
                .replace(/<\/ul>/g, '\n')
                .replace(/<li>(.*?)<\/li>/g, '- $1\n');
    }
    // For other formats, return as-is or implement other conversions
    return text;
  }

  static textToHTML(text, sourceType) {
    // Convert Markdown to HTML
    if (sourceType === 'text/markdown') {
      // This is a simplified version. In a real implementation,
      // you would use a library like Marked to properly convert Markdown to HTML.
      return text.replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/^\- (.*$)/gm, '<li>$1</li>')
                .replace(/^\n$/, '\n<ul>\n$1\n</ul>\n')
                .replace(/\n\n/g, '</p><p>')
                .replace(/^(.*)$/gm, '<p>$1</p>');
    }
    // For other formats, return as-is or implement other conversions
    return `<pre>${text}</pre>`;
  }

  static textToCSV(text, sourceType) {
    // Convert JSON to CSV
    if (sourceType === 'application/json') {
      try {
        const json = JSON.parse(text);
        if (!Array.isArray(json)) {
          throw new Error('JSON must be an array of objects');
        }

        const headers = Object.keys(json[0]);
        const rows = json.map(obj => headers.map(header => obj[header]));

        return [
          headers.join(','),
          ...rows.map(row => row.join(','))
        ].join('\n');
      } catch (error) {
        throw new Error('Invalid JSON format');
      }
    }
    // For other formats, return as-is or implement other conversions
    return text;
  }

  static textToJSON(text, sourceType) {
    // Convert CSV to JSON
    if (sourceType === 'text/csv') {
      const lines = text.split('\n');
      const headers = lines[0].split(',');
      const result = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;
        const obj = {};
        const currentLine = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = currentLine[j];
        }

        result.push(obj);
      }

      return JSON.stringify(result, null, 2);
    }
    // For other formats, return as-is or implement other conversions
    return JSON.stringify({ content: text });
  }
}
