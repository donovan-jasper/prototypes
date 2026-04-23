import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import { parseUrl } from './parser';
import { saveFile } from './storage';
import { createThumbnail } from './media-utils';

interface DownloadResult {
  title: string;
  type: 'video' | 'article' | 'image';
  fileUri: string;
  thumbnailUri?: string;
  source: string;
  duration?: number;
  fileSize?: number;
}

export async function downloadMedia(
  url: string,
  onProgress?: (current: number, total: number) => void
): Promise<DownloadResult> {
  const parsed = parseUrl(url);
  if (!parsed) {
    throw new Error('Could not parse URL');
  }

  // For videos, we need to get the actual download URL first
  let downloadUrl = url;
  let title = parsed.title || 'Untitled';
  let thumbnailUrl = parsed.thumbnail;

  if (parsed.type === 'video') {
    const videoInfo = await getVideoInfo(url);
    downloadUrl = videoInfo.downloadUrl;
    title = videoInfo.title;
    thumbnailUrl = videoInfo.thumbnail;
  }

  // Create a unique filename
  const extension = downloadUrl.split('.').pop() || 'mp4';
  const filename = `${Date.now()}.${extension}`;
  const fileUri = `${FileSystem.documentDirectory}media/${parsed.type}s/${filename}`;

  // Download the file
  const downloadResumable = FileSystem.createDownloadResumable(
    downloadUrl,
    fileUri,
    {},
    (downloadProgress) => {
      if (onProgress && downloadProgress.totalBytesExpectedToWrite) {
        onProgress(
          downloadProgress.totalBytesWritten,
          downloadProgress.totalBytesExpectedToWrite
        );
      }
    }
  );

  try {
    const { uri } = await downloadResumable.downloadAsync();
    const fileInfo = await FileSystem.getInfoAsync(uri);

    // Generate thumbnail if needed
    let thumbnailUri: string | undefined;
    if (parsed.type === 'video' && uri) {
      thumbnailUri = await createThumbnail(uri);
    } else if (parsed.type === 'image' && uri) {
      // For images, we can use the original as thumbnail
      thumbnailUri = uri;
    } else if (thumbnailUrl) {
      // Download the thumbnail
      const thumbnailFilename = `${Date.now()}_thumb.jpg`;
      const thumbnailUri = `${FileSystem.documentDirectory}media/thumbnails/${thumbnailFilename}`;
      await FileSystem.downloadAsync(thumbnailUrl, thumbnailUri);
    }

    return {
      title,
      type: parsed.type,
      fileUri: uri,
      thumbnailUri,
      source: parsed.source,
      duration: parsed.duration,
      fileSize: fileInfo.size,
    };
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to download media');
  }
}

export async function getVideoInfo(url: string): Promise<{
  title: string;
  downloadUrl: string;
  thumbnail: string;
  duration?: number;
}> {
  // In a real implementation, this would use yt-dlp or platform APIs
  // For this example, we'll simulate getting video info

  // This is a placeholder - in production you would:
  // 1. Use yt-dlp to get available formats
  // 2. Select the best quality available
  // 3. Return the direct download URL

  // For YouTube example:
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return {
      title: 'Sample Video',
      downloadUrl: 'https://example.com/sample-video.mp4',
      thumbnail: 'https://example.com/sample-thumbnail.jpg',
      duration: 120,
    };
  }

  // For other platforms, implement similar logic
  throw new Error('Unsupported video platform');
}
