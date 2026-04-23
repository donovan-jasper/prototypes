import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import CryptoJS from 'crypto-js';

interface FileInfo {
  uri: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other'; // Explicit types
  mimeType?: string;
  hash?: string;
  size?: number; // Size in bytes
  creationTime?: number; // Unix timestamp in milliseconds
}

interface CategorizedFiles {
  photos: FileInfo[];
  videos: FileInfo[];
  documents: FileInfo[];
  others: FileInfo[];
}

// Define common document extensions and MIME types
const DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.rtf', '.csv', '.json', '.xml', '.md'];
const DOCUMENT_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/plain',
  'text/rtf',
  'text/csv',
  'application/json',
  'application/xml',
  'text/markdown',
];

export class FileManager {
  private async ensureDirectoryExists(directoryUri: string): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(directoryUri);
    if (!dirInfo.exists) {
      console.log(`Creating directory: ${directoryUri}`);
      await FileSystem.makeDirectoryAsync(directoryUri, { intermediates: true });
    }
  }

  async scanPhotos(): Promise<FileInfo[]> {
    console.log('FileManager: Scanning photos and videos...');
    const { status } = await MediaLibrary.requestPermissionsAsync();

    if (status !== 'granted') {
      console.warn('MediaLibrary permission not granted!');
      throw new Error('MediaLibrary permission not granted');
    }

    const assets: FileInfo[] = [];
    let hasNextPage = true;
    let after: string | undefined = undefined;

    while (hasNextPage) {
      try {
        const media = await MediaLibrary.getAssetsAsync({
          first: 50, // Fetch 50 assets at a time
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: [MediaLibrary.SortBy.creationTime],
          after: after,
        });

        for (const asset of media.assets) {
          // MediaLibrary.Asset does not directly provide file size or specific mimeType.
          // Size will be undefined unless fetched separately via FileSystem.getInfoAsync.
          assets.push({
            uri: asset.uri,
            name: asset.filename,
            type: asset.mediaType === MediaLibrary.MediaType.photo ? 'image' : 'video',
            mimeType: asset.mediaType === MediaLibrary.MediaType.photo ? 'image/*' : 'video/*', // Generic MIME type
            creationTime: asset.creationTime, // Already in milliseconds
            // size: undefined, // Not directly available from MediaLibrary.Asset
          });
        }

        hasNextPage = media.hasNextPage;
        after = media.endCursor;
      } catch (error) {
        console.error('Error fetching media assets:', error);
        hasNextPage = false; // Stop on error
      }
    }
    console.log(`FileManager: Found ${assets.length} media assets.`);
    return assets;
  }

  async scanDocuments(): Promise<FileInfo[]> {
    console.log('FileManager: Scanning documents in app directories...');
    const documents: FileInfo[] = [];

    // Directories where the app might store documents
    // FileSystem.documentDirectory is the persistent storage for the app.
    // FileSystem.cacheDirectory is for temporary files.
    // Note: Accessing public directories like "Downloads" or "Documents"
    // is restricted by iOS/Android security models for apps.
    // For user-selected documents from external storage, expo-document-picker would be needed.
    // This scan focuses on files the app itself has access to or created within its sandbox.
    const directoriesToScan = [
      FileSystem.documentDirectory,
      FileSystem.cacheDirectory,
    ].filter(Boolean) as string[];

    for (const dirUri of directoriesToScan) {
      if (!dirUri) continue; // Should not happen with filter, but for safety
      try {
        const files = await FileSystem.readDirectoryAsync(dirUri);
        for (const fileName of files) {
          const fileUri = `${dirUri}${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          if (fileInfo.exists && fileInfo.isDirectory === false) {
            const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            const isDocument = DOCUMENT_EXTENSIONS.includes(extension);

            if (isDocument) {
              // Attempt to infer MIME type from extension
              const mimeType = DOCUMENT_MIME_TYPES[DOCUMENT_EXTENSIONS.indexOf(extension)] || 'application/octet-stream';
              documents.push({
                uri: fileUri,
                name: fileName,
                type: 'document',
                mimeType: mimeType,
                size: fileInfo.size,
                creationTime: fileInfo.modificationTime ? fileInfo.modificationTime * 1000 : undefined, // modificationTime is in seconds
              });
            }
          }
        }
      } catch (error) {
        console.warn(`Error scanning directory ${dirUri}:`, error);
      }
    }
    console.log(`FileManager: Found ${documents.length} documents.`);
    return documents;
  }

  async categorize(files: FileInfo[]): Promise<CategorizedFiles> {
    console.log('FileManager: Categorizing files...');
    const categorized: CategorizedFiles = { photos: [], videos: [], documents: [], others: [] };
    for (const file of files) {
      if (file.type === 'image') {
        categorized.photos.push(file);
      } else if (file.type === 'video') {
        categorized.videos.push(file);
      } else if (file.type === 'document' || (file.mimeType && DOCUMENT_MIME_TYPES.includes(file.mimeType))) {
        categorized.documents.push(file);
      } else {
        categorized.others.push(file);
      }
    }
    return categorized;
  }

  async findDuplicates(files: FileInfo[]): Promise<FileInfo[]> {
    console.log('FileManager: Finding duplicates...');
    const hashes = new Map<string, FileInfo>();
    const duplicates: FileInfo[] = [];

    for (const file of files) {
      if (file.hash) {
        if (hashes.has(file.hash)) {
          duplicates.push(file);
        } else {
          hashes.set(file.hash, file);
        }
      } else {
        console.warn(`File ${file.uri} has no hash, skipping duplicate check.`);
      }
    }
    console.log(`FileManager: Found ${duplicates.length} duplicate files.`);
    return duplicates;
  }

  async getFileHash(uri: string): Promise<string> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists || fileInfo.isDirectory) {
        throw new Error(`File does not exist or is a directory: ${uri}`);
      }

      const fileContentBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const hash = CryptoJS.SHA256(fileContentBase64).toString(CryptoJS.enc.Hex);
      return hash;
    } catch (error) {
      console.error(`Error hashing file ${uri}:`, error);
      throw new Error(`Failed to hash file: ${uri}`);
    }
  }

  async moveFile(fromUri: string, toUri: string): Promise<void> {
    console.log(`FileManager: Moving file from ${fromUri} to ${toUri}`);
    try {
      const fromFileInfo = await FileSystem.getInfoAsync(fromUri);
      if (!fromFileInfo.exists) {
        throw new Error(`Source file does not exist: ${fromUri}`);
      }

      const toDirectory = toUri.substring(0, toUri.lastIndexOf('/'));
      await this.ensureDirectoryExists(toDirectory);

      await FileSystem.moveAsync({ from: fromUri, to: toUri });
      console.log(`FileManager: Successfully moved file to ${toUri}`);
    } catch (error) {
      console.error(`Error moving file from ${fromUri} to ${toUri}:`, error);
      throw new Error(`Failed to move file: ${fromUri} to ${toUri}`);
    }
  }

  async deleteFile(uri: string): Promise<void> {
    console.log(`FileManager: Deleting file ${uri}`);
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        console.log(`File ${uri} does not exist, no need to delete.`);
        return;
      }
      await FileSystem.deleteAsync(uri, { idempotent: true });
      console.log(`FileManager: Successfully deleted file ${uri}`);
    } catch (error) {
      console.error(`Error deleting file ${uri}:`, error);
      throw new Error(`Failed to delete file: ${uri}`);
    }
  }
}
