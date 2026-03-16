# LocalForge

Privacy-first file converter suite that processes 75+ file formats entirely in your browser using WebAssembly—no uploads, no servers, just instant conversions.

## Features

- **Image Conversion**: Convert between PNG, JPG, WebP, GIF, BMP formats with quality/size controls
- **PDF Tools**: Merge, split, compress PDFs and convert PDF to images
- **Video/Audio Conversion**: Convert between MP4, WebM, MP3, WAV, OGG using FFmpeg.wasm
- **Document Conversion**: Convert between TXT, Markdown, HTML, CSV, JSON formats
- **Archive Tools**: Create and extract ZIP files with drag-and-drop support

## Tech Stack

- **Backend**: Node.js + Express (minimal API for serving static files)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **File Processing**: WebAssembly (via FFmpeg.wasm for media, pdf-lib for PDFs, JSZip for archives)
- **Storage**: None required (client-side only)
- **Database**: None required (stateless application)

## Setup

1. Clone the repository:
   
