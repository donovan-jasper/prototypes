# LocalForge

## One-line pitch
Privacy-first file converter suite that processes 75+ file formats entirely in your browser using WebAssembly—no uploads, no servers, just instant conversions.

## Tech stack
- **Backend**: Node.js + Express (minimal API for serving static files)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **File Processing**: WebAssembly (via FFmpeg.wasm for media, pdf-lib for PDFs, JSZip for archives)
- **Storage**: None required (client-side only)
- **Database**: None required (stateless application)

## Core features

1. **Image Conversion** - Convert between PNG, JPG, WebP, GIF, BMP formats with quality/size controls
2. **PDF Tools** - Merge, split, compress PDFs and convert PDF to images
3. **Video/Audio Conversion** - Convert between MP4, WebM, MP3, WAV, OGG using FFmpeg.wasm
4. **Document Conversion** - Convert between TXT, Markdown, HTML, CSV, JSON formats
5. **Archive Tools** - Create and extract ZIP files with drag-and-drop support

## File structure

```
localforge/
├── server.js
├── package.json
├── public/
│   ├── index.html
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── converters/
│   │   │   ├── image-converter.js
│   │   │   ├── pdf-converter.js
│   │   │   ├── media-converter.js
│   │   │   ├── document-converter.js
│   │   │   └── archive-converter.js
│   │   └── utils/
│   │       ├── file-handler.js
│   │       └── ui-manager.js
│   └── workers/
│       └── ffmpeg-worker.js
└── README.md
```

## Implementation steps

### Step 1: Initialize project
```bash
npm init -y
npm install express
npm install --save @ffmpeg/ffmpeg @ffmpeg/util
npm install --save pdf-lib
npm install --save jszip
```

### Step 2: Create Express server (server.js)
- Set up basic Express server on port 3000
- Serve static files from `public/` directory
- Add CORS headers for WebAssembly MIME types
- Configure proper headers for SharedArrayBuffer (COOP/COEP for FFmpeg)

### Step 3: Build main HTML structure (public/index.html)
- Create responsive layout with header, tool selector sidebar, and main conversion area
- Add file drop zone with drag-and-drop visual feedback
- Include tool category tabs: Images, PDFs, Media, Documents, Archives
- Add conversion options panel (format selector, quality slider, size options)
- Create progress indicator and download button area
- Include privacy notice emphasizing client-side processing
- Add meta tags for PWA capabilities

### Step 4: Style the interface (public/css/styles.css)
- Modern, clean design with CSS Grid for layout
- Card-based UI for tool selection
- Drag-and-drop zone with dashed border and hover effects
- Progress bar with animated gradient
- Responsive breakpoints for mobile/tablet/desktop
- Dark mode support using CSS variables
- Smooth transitions and micro-interactions

### Step 5: Implement file handling utilities (public/js/utils/file-handler.js)
- FileHandler class with methods:
  - `handleFileDrop(event)` - Process dropped files
  - `handleFileSelect(event)` - Process selected files from input
  - `validateFile(file, allowedTypes)` - Check file type and size
  - `readFileAsArrayBuffer(file)` - Read file for processing
  - `downloadFile(blob, filename)` - Trigger browser download
  - `formatFileSize(bytes)` - Human-readable file sizes

### Step 6: Implement UI manager (public/js/utils/ui-manager.js)
- UIManager class with methods:
  - `showProgress(percentage, message)` - Update progress bar
  - `showError(message)` - Display error notifications
  - `showSuccess(message)` - Display success notifications
  - `updateToolOptions(toolType)` - Show relevant conversion options
  - `enableDownload(blob, filename)` - Enable download button
  - `resetUI()` - Clear state for new conversion

### Step 7: Implement image converter (public/js/converters/image-converter.js)
- ImageConverter class with methods:
  - `convert(file, targetFormat, quality)` - Main conversion logic
  - `loadImage(arrayBuffer)` - Load image to canvas
  - `drawToCanvas(image, maxWidth, maxHeight)` - Resize if needed
  - `canvasToBlob(canvas, format, quality)` - Export as target format
- Support formats: PNG, JPG, WebP, GIF, BMP
- Add quality slider (0.1-1.0 for lossy formats)
- Add resize options (maintain aspect ratio)

### Step 8: Implement PDF converter (public/js/converters/pdf-converter.js)
- PDFConverter class using pdf-lib:
  - `mergePDFs(files)` - Combine multiple PDFs
  - `splitPDF(file, pageRanges)` - Extract specific pages
  - `compressPDF(file, quality)` - Reduce file size
  - `pdfToImages(file, format)` - Convert pages to images
- Add page range selector UI
- Add compression level options

### Step 9: Implement media converter (public/js/converters/media-converter.js)
- MediaConverter class using FFmpeg.wasm:
  - `loadFFmpeg()` - Initialize FFmpeg with proper threading
  - `convertVideo(file, targetFormat, options)` - Video conversion
  - `convertAudio(file, targetFormat, bitrate)` - Audio conversion
  - `extractAudio(videoFile)` - Extract audio from video
- Support formats: MP4, WebM, MP3, WAV, OGG
- Add bitrate/quality options
- Handle FFmpeg progress events for UI updates

### Step 10: Implement document converter (public/js/converters/document-converter.js)
- DocumentConverter class with methods:
  - `convertText(file, targetFormat)` - Convert between text formats
  - `markdownToHTML(markdown)` - Parse and convert markdown
  - `csvToJSON(csv)` - Parse CSV to JSON
  - `jsonToCSV(json)` - Convert JSON to CSV
- Support formats: TXT, MD, HTML, CSV, JSON
- Add preview pane for converted content

### Step 11: Implement archive converter (public/js/converters/archive-converter.js)
- ArchiveConverter class using JSZip:
  - `createZip(files)` - Create ZIP from multiple files
  - `extractZip(file)` - Extract and list ZIP contents
  - `addToZip(zip, file, path)` - Add file to archive
- Add file tree view for ZIP contents
- Support batch file selection for creating archives

### Step 12: Create FFmpeg worker (public/workers/ffmpeg-worker.js)
- Web Worker for FFmpeg operations to prevent UI blocking
- Message passing interface for conversion requests
- Progress reporting back to main thread
- Error handling and cleanup

### Step 13: Implement main app controller (public/js/app.js)
- Initialize all converter modules
- Set up event listeners for:
  - File drop zone
  - File input
  - Tool selection
  - Format selection
  - Convert button
  - Download button
- Route conversion requests to appropriate converter
- Handle errors and display user feedback
- Track conversion history in sessionStorage

### Step 14: Add PWA capabilities
- Create manifest.json with app metadata
- Add service worker for offline functionality (optional for MVP)
- Add install prompt for "Add to Home Screen"

### Step 15: Optimize and polish
- Add loading states for WebAssembly module initialization
- Implement file size warnings (e.g., >100MB files)
- Add keyboard shortcuts (Ctrl+O for open, Ctrl+S for save)
- Add tooltips explaining each tool
- Implement analytics events (client-side only, no tracking)

## How to test it works

### Setup
1. Run `npm install` to install dependencies
2. Run `node server.js` to start the server
3. Open `http://localhost:3000` in a modern browser (Chrome, Firefox, Edge)

### Test Image Conversion
1. Drag and drop a PNG image onto the drop zone
2. Select "Image Converter" from the sidebar
3. Choose "JPG" as target format
4. Adjust quality slider to 0.8
5. Click "Convert"
6. Verify progress bar appears and completes
7. Click "Download" and verify JPG file downloads
8. Open downloaded file to confirm conversion worked

### Test PDF Tools
1. Select "PDF Tools" from sidebar
2. Choose "Merge PDFs" option
3. Upload 2-3 PDF files
4. Click "Merge"
5. Download merged PDF and verify all pages are present

### Test Media Conversion
1. Select "Media Converter" from sidebar
2. Upload an MP4 video file (small, <10MB for testing)
3. Choose "MP3" as target format
4. Click "Convert"
5. Wait for FFmpeg to load and process (may take 10-30 seconds)
6. Download MP3 and verify audio plays correctly

### Test Document Conversion
1. Select "Document Converter" from sidebar
2. Create a simple Markdown file with headers and lists
3. Upload the .md file
4. Choose "HTML" as target format
5. Click "Convert"
6. Download HTML and open in browser to verify formatting

### Test Archive Tools
1. Select "Archive Tools" from sidebar
2. Choose "Create ZIP"
3. Upload 3-5 different files (images, documents, etc.)
4. Click "Create Archive"
5. Download ZIP file
6. Extract ZIP using system tools and verify all files are present

### Verify Privacy
1. Open browser DevTools Network tab
2. Perform any conversion
3. Verify no file upload requests are made to external servers
4. Confirm all processing happens locally (only static asset requests)

### Browser Compatibility
- Test in Chrome/Edge (primary target)
- Test in Firefox (verify WebAssembly support)
- Test in Safari (may have SharedArrayBuffer limitations)
- Verify mobile responsiveness on phone/tablet

### Performance Testing
- Test with large files (50MB+) to verify memory handling
- Test multiple conversions in sequence
- Monitor browser memory usage during conversions
- Verify UI remains responsive during processing