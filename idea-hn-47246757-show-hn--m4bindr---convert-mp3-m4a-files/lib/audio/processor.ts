import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';
import * as FileSystem from 'expo-file-system';

interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
}

interface Metadata {
  title: string;
  author: string;
  duration: number;
}

export const mergeAudioFiles = async (filePaths: string[]): Promise<string> => {
  if (filePaths.length === 0) {
    throw new Error('No files to merge');
  }

  // For simplicity, we'll just use the first file if there's only one
  if (filePaths.length === 1) {
    return filePaths[0];
  }

  // Create a temporary file for the merged output
  const outputPath = `${FileSystem.cacheDirectory}merged_${Date.now()}.m4b`;

  // Create a file list for FFmpeg
  const fileListPath = `${FileSystem.cacheDirectory}filelist.txt`;
  const fileListContent = filePaths.map(path => `file '${path}'`).join('\n');
  await FileSystem.writeAsStringAsync(fileListPath, fileListContent);

  // Merge the files
  const command = `-f concat -safe 0 -i "${fileListPath}" -c copy "${outputPath}"`;
  const session = await FFmpegKit.execute(command);

  // Clean up the file list
  await FileSystem.deleteAsync(fileListPath, { idempotent: true });

  // Check if the operation was successful
  const returnCode = await session.getReturnCode();
  if (returnCode.isValueSuccess()) {
    return outputPath;
  } else {
    throw new Error(`FFmpeg failed with code ${returnCode.getValue()}`);
  }
};

export const embedChapters = async (audioPath: string, chapters: Chapter[]): Promise<string> => {
  // Create a temporary file for the output
  const outputPath = `${FileSystem.cacheDirectory}chapters_${Date.now()}.m4b`;

  // Create a metadata file with chapter markers
  const metadataPath = `${FileSystem.cacheDirectory}metadata.txt`;
  let metadataContent = '';

  chapters.forEach((chapter, index) => {
    metadataContent += `[CHAPTER]\n`;
    metadataContent += `TIMEBASE=1/1000\n`;
    metadataContent += `START=${chapter.startTime}\n`;
    metadataContent += `TITLE=${chapter.title}\n\n`;
  });

  await FileSystem.writeAsStringAsync(metadataPath, metadataContent);

  // Use FFmpeg to embed the chapters
  const command = `-i "${audioPath}" -i "${metadataPath}" -map_metadata 1 -codec copy "${outputPath}"`;
  const session = await FFmpegKit.execute(command);

  // Clean up the metadata file
  await FileSystem.deleteAsync(metadataPath, { idempotent: true });

  // Check if the operation was successful
  const returnCode = await session.getReturnCode();
  if (returnCode.isValueSuccess()) {
    return outputPath;
  } else {
    throw new Error(`FFmpeg failed with code ${returnCode.getValue()}`);
  }
};

export const extractMetadata = async (filePath: string): Promise<Metadata> => {
  try {
    // Get basic metadata
    const metadataCommand = `-i "${filePath}" -show_format -v quiet -of json`;
    const metadataResult = await FFprobeKit.execute(metadataCommand);
    const metadataOutput = await metadataResult.getOutput();
    const metadata = JSON.parse(metadataOutput);

    // Get duration
    const durationCommand = `-i "${filePath}" -show_entries format=duration -v quiet -of csv=p=0`;
    const durationResult = await FFprobeKit.execute(durationCommand);
    const durationOutput = await durationResult.getOutput();
    const duration = parseFloat(durationOutput) * 1000; // Convert to milliseconds

    return {
      title: metadata.format.tags?.title || 'Untitled',
      author: metadata.format.tags?.artist || 'Unknown',
      duration: isNaN(duration) ? 0 : duration,
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    return {
      title: 'Untitled',
      author: 'Unknown',
      duration: 0,
    };
  }
};
