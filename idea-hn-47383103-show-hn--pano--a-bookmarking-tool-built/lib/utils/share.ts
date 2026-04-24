import { generateRandomString } from './random';

const BASE_URL = 'https://shelflife.app/share/';

export function generateShareLink(shelfId: number): string {
  // In a real app, this would generate a unique token and store it in the database
  // For this prototype, we'll just use a simple format
  const token = generateRandomString(16);
  return `${BASE_URL}${shelfId}?token=${token}`;
}

export function parseShareLink(url: string): { shelfId: number; token: string } | null {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    const shelfId = parseInt(pathParts[pathParts.length - 1], 10);

    if (isNaN(shelfId)) return null;

    const token = parsedUrl.searchParams.get('token');
    if (!token) return null;

    return { shelfId, token };
  } catch {
    return null;
  }
}

export function isValidShareLink(url: string): boolean {
  const parsed = parseShareLink(url);
  return parsed !== null;
}

export function getShelfIdFromLink(url: string): number | null {
  const parsed = parseShareLink(url);
  return parsed ? parsed.shelfId : null;
}
