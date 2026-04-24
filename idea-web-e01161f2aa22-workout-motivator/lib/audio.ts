import * as Speech from 'expo-speech';

let isSpeaking = false;

export async function speakPrompt(text: string, coachId: string, volume: number = 1.0): Promise<void> {
  if (isSpeaking) {
    await stopSpeaking();
  }

  return new Promise((resolve, reject) => {
    isSpeaking = true;

    const options: Speech.SpeechOptions = {
      language: 'en-US',
      pitch: getCoachPitch(coachId),
      rate: getCoachRate(coachId),
      volume: volume, // Add volume parameter
      onDone: () => {
        isSpeaking = false;
        resolve();
      },
      onError: (error) => {
        isSpeaking = false;
        reject(error);
      },
    };

    Speech.speak(text, options);
  });
}

export async function stopSpeaking(): Promise<void> {
  if (isSpeaking) {
    await Speech.stop();
    isSpeaking = false;
  }
}

function getCoachPitch(coachId: string): number {
  const pitchMap: Record<string, number> = {
    'drill-sergeant': 0.9,
    'zen-master': 0.8,
    'best-friend': 1.0,
    'comedian': 1.1,
    'stoic': 0.85,
  };
  return pitchMap[coachId] || 1.0;
}

function getCoachRate(coachId: string): number {
  const rateMap: Record<string, number> = {
    'drill-sergeant': 1.1,
    'zen-master': 0.8,
    'best-friend': 1.0,
    'comedian': 1.05,
    'stoic': 0.9,
  };
  return rateMap[coachId] || 1.0;
}

export function isSpeakingNow(): boolean {
  return isSpeaking;
}
