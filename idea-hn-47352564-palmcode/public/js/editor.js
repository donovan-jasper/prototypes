class FileManager {
  constructor() {
    this.sessionId = null;
    this.socket = null;
    this.currentFilePath = null;
    this.fileTreeElement = document.getElementById('file-tree');
    this.editorElement = document.getElementById('file-editor');
    this.editorContentElement = document.getElementById('editor-content');
    this.saveButton = document.getElementById('save-file-btn');
    this.fileNameDisplay = document.getElementById('current-file-name');

    // Initialize highlight.js
    hljs.highlightAll();

    // Set up event listeners
    this.saveButton.addEventListener('click', () => this.saveCurrentFile());
    this.editorContentElement.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveCurrentFile();
      }
    });

    // Initialize file tree click handlers
    this.fileTreeElement.addEventListener('click', (e) => {
      const fileItem = e.target.closest('.file-item');
      if (fileItem) {
        const path = fileItem.getAttribute('data-path');
        this.openFile(path);
      }

      const dirHeader = e.target.closest('.directory-header');
      if (dirHeader) {
        const children = dirHeader.nextElementSibling;
        children.style.display = children.style.display === 'none' ? 'block' : 'none';
      }
    });
  }

  initialize(sessionId, socket) {
    this.sessionId = sessionId;
    this.socket = socket;
    this.loadFileTree();

    // Listen for file changes from server
    this.socket.on('file-change', (change) => {
      if (change.type === 'change' && change.path === this.currentFilePath) {
        this.loadFileContent(change.path);
      } else {
        this.loadFileTree();
      }
    });
  }

  async loadFileTree() {
    try {
      const response = await fetch(`/api/files/${this.sessionId}`);
      if (!response.ok) throw new Error('Failed to load file tree');

      const fileTree = await response.json();
      this.renderFileTree(fileTree);
    } catch (error) {
      console.error('Error loading file tree:', error);
      this.fileTreeElement.innerHTML = '<div class="error">Failed to load files</div>';
    }
  }

  renderFileTree(tree) {
    this.fileTreeElement.innerHTML = this.renderTreeNode(tree);
  }

  renderTreeNode(node) {
    if (node.type === 'file') {
      return `
        <div class="file-item" data-path="${node.path}">
          <span class="file-icon">📄</span>
          <span class="file-name">${node.name}</span>
        </div>
      `;
    } else if (node.type === 'directory') {
      let childrenHtml = '';
      if (node.children && node.children.length > 0) {
        childrenHtml = node.children.map(child => this.renderTreeNode(child)).join('');
      }

      return `
        <div class="directory-item">
          <div class="directory-header" data-path="${node.path}">
            <span class="directory-icon">📁</span>
            <span class="directory-name">${node.name}</span>
          </div>
          <div class="directory-children" style="display: none;">${childrenHtml}</div>
        </div>
      `;
    }
    return '';
  }

  async openFile(path) {
    try {
      this.currentFilePath = path;
      this.fileNameDisplay.textContent = path.split('/').pop();

      const response = await fetch(`/api/files/${this.sessionId}/content?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to load file content');

      const content = await response.text();
      this.editorContentElement.value = content;

      // Highlight syntax
      this.highlightCode();

    } catch (error) {
      console.error('Error opening file:', error);
      this.editorContentElement.value = 'Error loading file content';
    }
  }

  async loadFileContent(path) {
    try {
      const response = await fetch(`/api/files/${this.sessionId}/content?path=${encodeURIComponent(path)}`);
      if (!response.ok) throw new Error('Failed to load file content');

      const content = await response.text();
      this.editorContentElement.value = content;

      // Highlight syntax
      this.highlightCode();

    } catch (error) {
      console.error('Error loading file content:', error);
    }
  }

  async saveCurrentFile() {
    if (!this.currentFilePath) return;

    try {
      const content = this.editorContentElement.value;

      const response = await fetch(`/api/files/${this.sessionId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: this.currentFilePath,
          content: content
        })
      });

      if (!response.ok) throw new Error('Failed to save file');

      // Show save confirmation
      this.saveButton.textContent = 'Saved!';
      setTimeout(() => {
        this.saveButton.textContent = 'Save';
      }, 2000);

    } catch (error) {
      console.error('Error saving file:', error);
      alert('Failed to save file');
    }
  }

  highlightCode() {
    // Remove previous highlighting
    this.editorContentElement.classList.remove('hljs');

    // Detect language from file extension
    const extension = this.currentFilePath.split('.').pop();
    let language = 'plaintext';

    const languageMap = {
      js: 'javascript',
      ts: 'typescript',
      html: 'html',
      css: 'css',
      json: 'json',
      py: 'python',
      java: 'java',
      c: 'c',
      cpp: 'cpp',
      rb: 'ruby',
      php: 'php',
      go: 'go',
      rs: 'rust',
      swift: 'swift',
      kt: 'kotlin',
      sh: 'bash',
      md: 'markdown',
      yaml: 'yaml',
      xml: 'xml'
    };

    if (languageMap[extension]) {
      language = languageMap[extension];
    }

    // Apply syntax highlighting
    this.editorContentElement.classList.add('hljs');
    hljs.highlightElement(this.editorContentElement);
  }

  clear() {
    this.currentFilePath = null;
    this.fileNameDisplay.textContent = 'No file selected';
    this.editorContentElement.value = '';
    this.fileTreeElement.innerHTML = '';
  }
}
