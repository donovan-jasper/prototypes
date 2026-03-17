import { ContentType } from '@/types';

export interface ParsedContent {
  type: ContentType;
  title: string;
  source: string;
  url: string;
  thumbnailUrl?: string;
}

const VIDEO_PLATFORMS = [
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'instagram.com',
  'vimeo.com',
  'dailymotion.com',
  'twitch.tv',
];

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];

export function detectContentType(url: string): ContentType {
  const lowerUrl = url.toLowerCase();
  
  // Check for video platforms
  for (const platform of VIDEO_PLATFORMS) {
    if (lowerUrl.includes(platform)) {
      return 'video';
    }
  }
  
  // Check for image extensions
  for (const ext of IMAGE_EXTENSIONS) {
    if (lowerUrl.endsWith(ext)) {
      return 'image';
    }
  }
  
  // Default to article
  return 'article';
}

export function extractMetadata(url: string, type: ContentType): { title: string; source: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.replace('www.', '');
    const pathname = urlObj.pathname;
    
    // Extract title from URL path
    let title = '';
    
    if (type === 'video') {
      // For YouTube
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        const videoId = urlObj.searchParams.get('v') || pathname.split('/').pop();
        title = `YouTube Video ${videoId}`;
      }
      // For TikTok
      else if (hostname.includes('tiktok.com')) {
        const parts = pathname.split('/').filter(p => p);
        title = parts.length > 1 ? `TikTok by @${parts[0]}` : 'TikTok Video';
      }
      // For Instagram
      else if (hostname.includes('instagram.com')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts[0] === 'p' || parts[0] === 'reel') {
          title = `Instagram ${parts[0] === 'reel' ? 'Reel' : 'Post'}`;
        } else {
          title = 'Instagram Video';
        }
      }
      // Generic video
      else {
        title = `Video from ${hostname}`;
      }
    } else if (type === 'image') {
      const filename = pathname.split('/').pop() || 'image';
      title = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      title = title.charAt(0).toUpperCase() + title.slice(1);
    } else {
      // Article - try to extract from path
      const pathParts = pathname.split('/').filter(p => p && p !== 'article' && p !== 'post');
      if (pathParts.length > 0) {
        const lastPart = pathParts[pathParts.length - 1];
        title = lastPart
          .replace(/[-_]/g, ' ')
          .replace(/\.[^/.]+$/, '')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      } else {
        title = `Article from ${hostname}`;
      }
    }
    
    return {
      title: title || `Content from ${hostname}`,
      source: hostname,
    };
  } catch (error) {
    return {
      title: 'Saved Content',
      source: 'Unknown',
    };
  }
}

export function parseUrl(url: string): ParsedContent {
  const type = detectContentType(url);
  const { title, source } = extractMetadata(url, type);
  
  return {
    type,
    title,
    source,
    url,
  };
}
