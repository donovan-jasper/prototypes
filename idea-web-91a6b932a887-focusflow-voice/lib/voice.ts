import { VoicePacks } from '../constants/VoicePacks';

export const getVoicePack = (name: string) => {
  const pack = VoicePacks.find(p => p.name === name);
  if (!pack) {
    return VoicePacks[0]; // default pack
  }
  return pack;
};

export const generateCoachingMessage = (
  phase: 'start' | 'midpoint' | 'end' | 'pause' | 'resume',
  duration: number,
  voicePack: string
): string => {
  const pack = getVoicePack(voicePack);

  switch (phase) {
    case 'start':
      return pack.messages.start.replace('{duration}', duration.toString());
    case 'midpoint':
      return pack.messages.midpoint.replace('{duration}', duration.toString());
    case 'end':
      return pack.messages.end.replace('{duration}', duration.toString());
    case 'pause':
      return pack.messages.pause;
    case 'resume':
      return pack.messages.resume;
    default:
      return "Let's focus!";
  }
};
