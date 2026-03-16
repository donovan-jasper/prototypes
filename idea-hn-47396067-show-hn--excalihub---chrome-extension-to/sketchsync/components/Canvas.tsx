import { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas as SkiaCanvas, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useDrawingStore } from '@/store/useDrawingStore';
import { useGestures } from '@/hooks/useGestures';

export function Canvas() {
  const { elements, addElement, currentTool, currentColor, strokeWidth } = useDrawingStore();
  const canvasRef = useRef(null);
  const pathRef = useRef(Skia.Path.Make());
  const { panGesture, pinchGesture } = useGestures();

  const combinedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const handleTouch = (event) => {
    const { x, y } = event.nativeEvent;
    const path = pathRef.current;

    if (currentTool === 'pen') {
      path.lineTo(x, y);
      addElement({
        type: 'path',
        path: path.toSVGString(),
        color: currentColor,
        strokeWidth: strokeWidth,
      });
    }
  };

  useEffect(() => {
    if (currentTool === 'pen') {
      pathRef.current = Skia.Path.Make();
      pathRef.current.moveTo(0, 0);
    }
  }, [currentTool]);

  return (
    <GestureDetector gesture={combinedGesture}>
      <View style={styles.container}>
        <SkiaCanvas
          ref={canvasRef}
          style={styles.canvas}
          onTouchMove={handleTouch}
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
