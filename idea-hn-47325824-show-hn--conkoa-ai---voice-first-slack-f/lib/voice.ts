import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

let recording: Audio.Recording | null = null;

export async function startRecording() {
  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording: newRecording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recording = newRecording;
  } catch (err) {
    console.error('Failed to start recording', err);
  }
}

export async function stopRecording() {
  if (!recording) return null;

  await recording.stopAndUnloadAsync();
  const uri = recording.getURI();
  recording = null;
  return uri;
}

export async function transcribeAudio(audioUri: string): Promise<{ text: string }> {
  const base64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      file: base64,
      model: 'whisper-1',
    }),
  });

  const data = await response.json();
  return { text: data.text };
}

export function extractIntent(text: string) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('remind me') || lowerText.includes('add task')) {
    return { type: 'task', action: 'create' };
  }
  
  if (lowerText.includes('tell') || lowerText.includes('message')) {
    return { type: 'message', action: 'send' };
  }
  
  if (lowerText.includes('what') || lowerText.includes('when') || lowerText.includes('who')) {
    return { type: 'query', action: 'search' };
  }
  
  return { type: 'message', action: 'send' };
}
