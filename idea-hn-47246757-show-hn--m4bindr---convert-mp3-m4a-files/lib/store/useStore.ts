import { create } from 'zustand';

const useStore = create((set) => ({
  currentAudiobook: null,
  isPlaying: false,
  position: 0,
  speed: 1.0,
  setCurrentAudiobook: (audiobook) => set({ currentAudiobook: audiobook }),
  setPlaybackState: (isPlaying) => set({ isPlaying }),
  setPosition: (position) => set({ position }),
  setSpeed: (speed) => set({ speed }),
}));

export default useStore;
