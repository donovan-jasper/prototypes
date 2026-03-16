import { Gesture } from 'react-native-gesture-handler';

export const useGestures = () => {
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      console.log('Pan gesture:', e.translationX, e.translationY);
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      console.log('Pinch gesture:', e.scale);
    });

  return {
    panGesture,
    pinchGesture,
  };
};
