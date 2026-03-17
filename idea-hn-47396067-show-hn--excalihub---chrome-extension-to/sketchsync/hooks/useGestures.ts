import { Gesture } from 'react-native-gesture-handler';
import { useDrawingStore } from '@/store/useDrawingStore';

export const useGestures = () => {
  const { currentTool } = useDrawingStore();

  const panGesture = Gesture.Pan()
    .enabled(currentTool === 'move')
    .onUpdate((e) => {
      console.log('Pan gesture:', e.translationX, e.translationY);
    });

  const pinchGesture = Gesture.Pinch()
    .enabled(currentTool === 'zoom')
    .onUpdate((e) => {
      console.log('Pinch gesture:', e.scale);
    });

  return {
    panGesture,
    pinchGesture,
  };
};
