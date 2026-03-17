import * as FileSystem from 'expo-file-system';

const MANGA_DIR = `${FileSystem.documentDirectory}manga/`;

export async function ensureMangaDirectory() {
  const dirInfo = await FileSystem.getInfoAsync(MANGA_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(MANGA_DIR, { intermediates: true });
  }
}

export async function savePage(
  mangaId: string,
  pageNumber: number,
  base64Data: string
): Promise<string> {
  await ensureMangaDirectory();
  
  const mangaDir = `${MANGA_DIR}${mangaId}/`;
  const dirInfo = await FileSystem.getInfoAsync(mangaDir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(mangaDir, { intermediates: true });
  }
  
  const uri = `${mangaDir}page-${pageNumber}.jpg`;
  await FileSystem.writeAsStringAsync(uri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });
  
  return uri;
}

export async function getPageUri(mangaId: string, pageNumber: number): Promise<string> {
  return `${MANGA_DIR}${mangaId}/page-${pageNumber}.jpg`;
}

export async function deleteMangaFiles(mangaId: string) {
  const mangaDir = `${MANGA_DIR}${mangaId}/`;
  const dirInfo = await FileSystem.getInfoAsync(mangaDir);
  if (dirInfo.exists) {
    await FileSystem.deleteAsync(mangaDir, { idempotent: true });
  }
}

export async function getAllPages(mangaId: string): Promise<string[]> {
  const mangaDir = `${MANGA_DIR}${mangaId}/`;
  const dirInfo = await FileSystem.getInfoAsync(mangaDir);
  
  if (!dirInfo.exists) {
    return [];
  }
  
  const files = await FileSystem.readDirectoryAsync(mangaDir);
  return files
    .filter((file) => file.startsWith('page-'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    })
    .map((file) => `${mangaDir}${file}`);
}
