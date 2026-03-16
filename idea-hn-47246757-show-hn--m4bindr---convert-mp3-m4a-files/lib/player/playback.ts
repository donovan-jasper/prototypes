import useStore from '@/lib/store/useStore';

export const usePlayer = () => {
  const currentAudiobook = useStore((state) => state.currentAudiobook);
  const isPlaying = useStore((state) => state.isPlaying);
  const position = useStore((state) => state.position);
  const speed = useStore((state) => state.speed);
  const setCurrentAudiobook = useStore((state) => state.setCurrentAudiobook);
  const setPlaybackState = useStore((state) => state.setPlaybackState);
  const setPosition = useStore((state) => state.setPosition);
  const setSpeed = useStore((state) => state.setSpeed);

  return {
    currentAudiobook,
    isPlaying,
    position,
    speed,
    setCurrentAudiobook,
    setPlaybackState,
    setPosition,
    setSpeed,
  };
};

export const calculateProgress = (position: number, duration: number) => {
  return (position / duration) * 100;
};

export const formatTime = (millis: number) => {
  const hours = Math.floor(millis / 3600000);
  const minutes = Math.floor((millis % 3600000) / 60000);
  const seconds = Math.floor((millis % 60000) / 1000);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};
