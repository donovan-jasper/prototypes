class FileManager {
  constructor() {
    this.socket = null;
    this.currentSessionId = null;
    this.currentFilePath = null;
    this.fileTree = document.getElementById('file-tree');
    this.fileEditor = document.getElementById('file-editor');
    this.saveFileBtn = document.getElementById('save-file-btn');
  }

  initialize(socket, sessionId) {
    this.socket = socket;
    this.currentSessionId = sessionId;

    this.socket.on('file-change', (data) => {
      this.loadFileTree();
    });

    this.saveFileBtn.addEventListener('click', () => {
      this.saveFile();
    });

    this.fileEditor.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.saveFile();
      }
    });

    this.loadFileTree();
  }

  async loadFileTree() {
    try {
      const response = await fetch(`/api/files/${this.currentSessionId}`);
      const files = await response.json();
      this.renderFileTree(files);
    } catch (error) {
      console.error('Error loading file tree:', error);
    }
  }

  renderFileTree(files, parentElement = this.fileTree, indent = 0) {
    parentElement.innerHTML = '';

    files.forEach(file => {
      const item = document.createElement('div');
      item.className = `file-tree-item ${file.type}`;
      item.style.marginLeft = `${indent}px`;
      item.textContent = file.name;

      if (file.type === 'directory') {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'file-tree-children';
        this.renderFileTree(file.children, childrenContainer, indent + 10);
        item.appendChild(childrenContainer);
      }

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        if (file.type === 'file') {
          this.openFile(file.path);
        }
      });

      parentElement.appendChild(item);
    });
  }

  async openFile(path) {
    try {
      const response = await fetch(`/api/files/${this.currentSessionId}/content?path=${encodeURIComponent(path)}`);
      const data = await response.json();
      this.fileEditor.value = data.content;
      this.currentFilePath = path;

      // Highlight syntax based on file extension
      const extension = path.split('.').pop();
      hljs.highlightElement(this.fileEditor);
      this.fileEditor.setAttribute('data-language', extension);
    } catch (error) {
      console.error('Error opening file:', error);
    }
  }

  async saveFile() {
    if (!this.currentFilePath) return;

    try {
      await fetch(`/api/files/${this.currentSessionId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path: this.currentFilePath,
          content: this.fileEditor.value,
        }),
      });
    } catch (error) {
      console.error('Error saving file:', error);
    }
  }

  async createFile(path) {
    try {
      await fetch(`/api/files/${this.currentSessionId}/content`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          path,
          content: '',
        }),
      });
      this.loadFileTree();
    } catch (error) {
      console.error('Error creating file:', error);
    }
  }

  async deleteFile(path) {
    if (confirm('Are you sure you want to delete this file?')) {
      try {
        await fetch(`/api/files/${this.currentSessionId}?path=${encodeURIComponent(path)}`, {
          method: 'DELETE',
        });
        this.loadFileTree();
        if (this.currentFilePath === path) {
          this.fileEditor.value = '';
          this.currentFilePath = null;
        }
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }
  }
}

export default FileManager;
