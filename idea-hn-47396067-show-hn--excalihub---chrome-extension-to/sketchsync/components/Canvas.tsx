import { useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas as SkiaCanvas, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { useDrawingStore } from '@/store/useDrawingStore';
import { useGestures } from '@/hooks/useGestures';

export function Canvas() {
  const { elements, addElement, currentTool, currentColor, strokeWidth } = useDrawingStore();
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentPath = useSharedValue<string>('');
  const { panGesture, pinchGesture } = useGestures();

  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleTouchStart = (event: any) => {
    if (currentTool !== 'pen') return;
    
    const { locationX, locationY } = event.nativeEvent;
    setIsDrawing(true);
    
    const path = Skia.Path.Make();
    path.moveTo(locationX, locationY);
    currentPath.value = path.toSVGString();
  };

  const handleTouchMove = (event: any) => {
    if (!isDrawing || currentTool !== 'pen') return;
    
    const { locationX, locationY } = event.nativeEvent;
    const path = Skia.Path.MakeFromSVGString(currentPath.value);
    
    if (path) {
      path.lineTo(locationX, locationY);
      currentPath.value = path.toSVGString();
    }
  };

  const handleTouchEnd = () => {
    if (!isDrawing || currentTool !== 'pen') return;
    
    setIsDrawing(false);
    
    if (currentPath.value) {
      addElement({
        type: 'path',
        path: currentPath.value,
        color: currentColor,
        strokeWidth: strokeWidth,
      });
      currentPath.value = '';
    }
  };

  return (
    <GestureDetector gesture={combinedGesture}>
      <View style={styles.container}>
        <SkiaCanvas
          ref={canvasRef}
          style={styles.canvas}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {elements.map((element, index) => (
            <Path
              key={index}
              path={element.path}
              color={element.color}
              style="stroke"
              strokeWidth={element.strokeWidth}
            />
          ))}
          {isDrawing && currentPath.value && (
            <Path
              path={currentPath.value}
              color={currentColor}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          )}
        </SkiaCanvas>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});
