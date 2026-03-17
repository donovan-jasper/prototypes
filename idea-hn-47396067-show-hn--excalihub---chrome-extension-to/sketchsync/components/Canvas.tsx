import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas as SkiaCanvas, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useDrawingStore } from '@/store/useDrawingStore';

export function Canvas() {
  const { elements, addElement, currentTool, currentColor, strokeWidth } = useDrawingStore();
  const [currentPath, setCurrentPath] = useState<string>('');

  const drawingGesture = Gesture.Pan()
    .enabled(currentTool === 'pen')
    .onStart((e) => {
      const path = Skia.Path.Make();
      path.moveTo(e.x, e.y);
      setCurrentPath(path.toSVGString());
    })
    .onUpdate((e) => {
      const path = Skia.Path.MakeFromSVGString(currentPath);
      if (path) {
        path.lineTo(e.x, e.y);
        setCurrentPath(path.toSVGString());
      }
    })
    .onEnd(() => {
      if (currentPath) {
        addElement({
          type: 'path',
          path: currentPath,
          color: currentColor,
          strokeWidth: strokeWidth,
        });
        setCurrentPath('');
      }
    });

  return (
    <GestureDetector gesture={drawingGesture}>
      <View style={styles.container}>
        <SkiaCanvas style={styles.canvas}>
          {elements.map((element, index) => (
            <Path
              key={index}
              path={element.path}
              color={element.color}
              style="stroke"
              strokeWidth={element.strokeWidth}
            />
          ))}
          {currentPath && (
            <Path
              path={currentPath}
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
