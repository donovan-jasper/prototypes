import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import CryptoJS from 'crypto-js';

interface FileInfo {
  uri: string;
  name: string;
  type: 'image' | 'video' | 'document' | 'other'; 
  mimeType?: string;
  hash?: string;
  size?: number; 
  creationTime?: number; 
}

interface CategorizedFiles {
  photos: FileInfo[];
  videos: FileInfo[];
  documents: FileInfo[];
  others: FileInfo[];
}

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
          first: 50, 
          mediaType: [MediaLibrary.MediaType.photo, MediaLibrary.MediaType.video],
          sortBy: [MediaLibrary.SortBy.creationTime],
          after: after,
        });

        for (const asset of media.assets) {
          assets.push({
            uri: asset.uri,
            name: asset.filename,
            type: asset.mediaType === MediaLibrary.MediaType.photo ? 'image' : 'video',
            mimeType: asset.mediaType === MediaLibrary.MediaType.photo ? 'image/*' : 'video/*', 
            creationTime: asset.creationTime, 
          });
        }

        hasNextPage = media.hasNextPage;
        after = media.endCursor;
      } catch (error) {
        console.error('Error fetching media assets:', error);
        hasNextPage = false; 
      }
    }
    console.log(`FileManager: Found ${assets.length} media assets.`);
    return assets;
  }

  async scanDocuments(): Promise<FileInfo[]> {
    console.log('FileManager: Scanning documents in app directories...');
    const documents: FileInfo[] = [];

    const directoriesToScan = [
      FileSystem.documentDirectory,
      FileSystem.cacheDirectory,
    ].filter(Boolean) as string[];

    for (const dirUri of directoriesToScan) {
      if (!dirUri) continue; 
      try {
        const files = await FileSystem.readDirectoryAsync(dirUri);
        for (const fileName of files) {
          const fileUri = `${dirUri}${fileName}`;
          const fileInfo = await FileSystem.getInfoAsync(fileUri);

          if (fileInfo.exists && fileInfo.isDirectory === false) {
            const extension = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            const isDocument = DOCUMENT_EXTENSIONS.includes(extension);

            if (isDocument) {
              const mimeType = DOCUMENT_MIME_TYPES[DOCUMENT_EXTENSIONS.indexOf(extension)] || 'application/octet-stream';
              documents.push({
                uri: fileUri,
                name: fileName,
                type: 'document',
                mimeType,
              });
            }
          }
        }
      } catch (error) {
        console.error('Error scanning directory:', error);
      }
    }
    console.log(`FileManager: Found ${documents.length} documents.`);
    return documents;
  }

  async categorizeFiles(files: FileInfo[]): Promise<CategorizedFiles> {
    const categorizedFiles: CategorizedFiles = {
      photos: [],
      videos: [],
      documents: [],
      others: [],
    };

    for (const file of files) {
      switch (file.type) {
        case 'image':
          categorizedFiles.photos.push(file);
          break;
        case 'video':
          categorizedFiles.videos.push(file);
          break;
        case 'document':
          categorizedFiles.documents.push(file);
          break;
        default:
          categorizedFiles.others.push(file);
      }
    }

    return categorizedFiles;
  }
}
