import { FFmpegKit, FFprobeKit } from 'ffmpeg-kit-react-native';

interface Chapter {
  title: string;
  startTime: number;
  endTime: number;
}

export const detectChaptersByTime = (duration: number, count: number): Chapter[] => {
  const chapters: Chapter[] = [];
  const chapterDuration = duration / count;

  for (let i = 0; i < count; i++) {
    chapters.push({
      title: `Chapter ${i + 1}`,
      startTime: Math.round(i * chapterDuration),
      endTime: Math.round((i + 1) * chapterDuration),
    });
  }

  // Ensure the last chapter ends at the total duration
  if (chapters.length > 0) {
    chapters[chapters.length - 1].endTime = duration;
  }

  return chapters;
};

export const detectChaptersBySilence = async (
  audioPath: string,
  threshold: number = -40,
  minDuration: number = 2
): Promise<Chapter[]> => {
  try {
    // First get the total duration
    const durationCommand = `-i "${audioPath}" -show_entries format=duration -v quiet -of csv=p=0`;
    const durationResult = await FFprobeKit.execute(durationCommand);
    const durationOutput = await durationResult.getOutput();
    const totalDuration = parseFloat(durationOutput);

    if (isNaN(totalDuration) || totalDuration <= 0) {
      throw new Error('Invalid audio duration');
    }

    // Detect silence segments
    const silenceCommand = `-i "${audioPath}" -af "silencedetect=n=${threshold}dB:d=${minDuration}" -f null -`;
    const silenceResult = await FFmpegKit.execute(silenceCommand);
    const silenceOutput = await silenceResult.getOutput();

    // Parse silence segments
    const silenceRegex = /silence_start: (\d+\.\d+)/g;
    const silenceMatches = silenceOutput.matchAll(silenceRegex);
    const silenceTimes = Array.from(silenceMatches).map(match => parseFloat(match[1]));

    // Create chapters between silence segments
    const chapters: Chapter[] = [];
    let lastEnd = 0;

    for (let i = 0; i < silenceTimes.length; i++) {
      const startTime = lastEnd;
      const endTime = silenceTimes[i] * 1000; // Convert to milliseconds

      if (endTime - startTime > 1000) { // Only create chapter if it's at least 1 second
        chapters.push({
          title: `Chapter ${chapters.length + 1}`,
          startTime: Math.round(startTime),
          endTime: Math.round(endTime),
        });
      }

      lastEnd = endTime;
    }

    // Add final chapter if there's remaining audio
    if (lastEnd < totalDuration * 1000) {
      chapters.push({
        title: `Chapter ${chapters.length + 1}`,
        startTime: Math.round(lastEnd),
        endTime: Math.round(totalDuration * 1000),
      });
    }

    // If no silence detected, fall back to time-based chapters
    if (chapters.length === 0) {
      return detectChaptersByTime(totalDuration * 1000, 4);
    }

    return chapters;
  } catch (error) {
    console.error('Error detecting silence:', error);
    // Fallback to time-based chapters if silence detection fails
    try {
      const durationCommand = `-i "${audioPath}" -show_entries format=duration -v quiet -of csv=p=0`;
      const durationResult = await FFprobeKit.execute(durationCommand);
      const durationOutput = await durationResult.getOutput();
      const totalDuration = parseFloat(durationOutput);

      if (!isNaN(totalDuration) && totalDuration > 0) {
        return detectChaptersByTime(totalDuration * 1000, 4);
      }
    } catch (fallbackError) {
      console.error('Fallback chapter detection failed:', fallbackError);
    }

    // Final fallback - create a single chapter for the entire file
    return [{
      title: 'Chapter 1',
      startTime: 0,
      endTime: 3600000 // Default to 1 hour if we can't determine duration
    }];
  }
};
