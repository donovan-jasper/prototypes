import { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas as SkiaCanvas, Path, Circle, Rect, Line, Skia } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useDrawingStore } from '@/store/useDrawingStore';

interface Point {
  x: number;
  y: number;
}

export function Canvas() {
  const { elements, addElement, currentTool, currentColor, strokeWidth } = useDrawingStore();
  const [currentPath, setCurrentPath] = useState<string>('');
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);

  const recognizeShape = (path: string): { type: 'circle' | 'rectangle' | null; data: any } => {
    const skiaPath = Skia.Path.MakeFromSVGString(path);
    if (!skiaPath) return { type: null, data: null };

    const bounds = skiaPath.getBounds();
    const width = bounds.width;
    const height = bounds.height;

    // Check if path is closed (endpoints are close)
    const commands = path.match(/[ML][\d\s.,-]+/g);
    if (!commands || commands.length < 3) return { type: null, data: null };

    const firstPoint = commands[0].match(/[\d.]+/g);
    const lastPoint = commands[commands.length - 1].match(/[\d.]+/g);
    
    if (!firstPoint || !lastPoint) return { type: null, data: null };

    const startX = parseFloat(firstPoint[0]);
    const startY = parseFloat(firstPoint[1]);
    const endX = parseFloat(lastPoint[0]);
    const endY = parseFloat(lastPoint[1]);

    const distance = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const isClosed = distance < 20;

    if (!isClosed) return { type: null, data: null };

    // Check if it's roughly circular (width ≈ height)
    const aspectRatio = width / height;
    if (aspectRatio > 0.8 && aspectRatio < 1.2) {
      const radius = (width + height) / 4;
      const centerX = bounds.x + width / 2;
      const centerY = bounds.y + height / 2;
      
      return {
        type: 'circle',
        data: { centerX, centerY, radius }
      };
    }

    // Check if it's roughly rectangular
    if (width > 20 && height > 20) {
      return {
        type: 'rectangle',
        data: { x: bounds.x, y: bounds.y, width, height }
      };
    }

    return { type: null, data: null };
  };

  const penGesture = Gesture.Pan()
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
        const recognized = recognizeShape(currentPath);
        
        if (recognized.type === 'circle') {
          addElement({
            type: 'circle',
            centerX: recognized.data.centerX,
            centerY: recognized.data.centerY,
            radius: recognized.data.radius,
            color: currentColor,
            strokeWidth: strokeWidth,
          });
        } else if (recognized.type === 'rectangle') {
          addElement({
            type: 'rectangle',
            x: recognized.data.x,
            y: recognized.data.y,
            width: recognized.data.width,
            height: recognized.data.height,
            color: currentColor,
            strokeWidth: strokeWidth,
          });
        } else {
          addElement({
            type: 'path',
            path: currentPath,
            color: currentColor,
            strokeWidth: strokeWidth,
          });
        }
        
        setCurrentPath('');
      }
    });

  const rectangleGesture = Gesture.Pan()
    .enabled(currentTool === 'rectangle')
    .onStart((e) => {
      setStartPoint({ x: e.x, y: e.y });
      setCurrentPoint({ x: e.x, y: e.y });
    })
    .onUpdate((e) => {
      setCurrentPoint({ x: e.x, y: e.y });
    })
    .onEnd((e) => {
      if (startPoint) {
        const x = Math.min(startPoint.x, e.x);
        const y = Math.min(startPoint.y, e.y);
        const width = Math.abs(e.x - startPoint.x);
        const height = Math.abs(e.y - startPoint.y);
        
        addElement({
          type: 'rectangle',
          x,
          y,
          width,
          height,
          color: currentColor,
          strokeWidth: strokeWidth,
        });
        
        setStartPoint(null);
        setCurrentPoint(null);
      }
    });

  const circleGesture = Gesture.Pan()
    .enabled(currentTool === 'circle')
    .onStart((e) => {
      setStartPoint({ x: e.x, y: e.y });
      setCurrentPoint({ x: e.x, y: e.y });
    })
    .onUpdate((e) => {
      setCurrentPoint({ x: e.x, y: e.y });
    })
    .onEnd((e) => {
      if (startPoint) {
        const radius = Math.sqrt(
          Math.pow(e.x - startPoint.x, 2) + Math.pow(e.y - startPoint.y, 2)
        );
        
        addElement({
          type: 'circle',
          centerX: startPoint.x,
          centerY: startPoint.y,
          radius,
          color: currentColor,
          strokeWidth: strokeWidth,
        });
        
        setStartPoint(null);
        setCurrentPoint(null);
      }
    });

  const lineGesture = Gesture.Pan()
    .enabled(currentTool === 'line')
    .onStart((e) => {
      setStartPoint({ x: e.x, y: e.y });
      setCurrentPoint({ x: e.x, y: e.y });
    })
    .onUpdate((e) => {
      setCurrentPoint({ x: e.x, y: e.y });
    })
    .onEnd((e) => {
      if (startPoint) {
        addElement({
          type: 'line',
          startX: startPoint.x,
          startY: startPoint.y,
          endX: e.x,
          endY: e.y,
          color: currentColor,
          strokeWidth: strokeWidth,
        });
        
        setStartPoint(null);
        setCurrentPoint(null);
      }
    });

  const composedGesture = Gesture.Race(
    penGesture,
    rectangleGesture,
    circleGesture,
    lineGesture
  );

  const renderPreview = () => {
    if (!startPoint || !currentPoint) return null;

    if (currentTool === 'rectangle') {
      const x = Math.min(startPoint.x, currentPoint.x);
      const y = Math.min(startPoint.y, currentPoint.y);
      const width = Math.abs(currentPoint.x - startPoint.x);
      const height = Math.abs(currentPoint.y - startPoint.y);
      
      return (
        <Rect
          x={x}
          y={y}
          width={width}
          height={height}
          color={currentColor}
          style="stroke"
          strokeWidth={strokeWidth}
        />
      );
    }

    if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(currentPoint.x - startPoint.x, 2) + Math.pow(currentPoint.y - startPoint.y, 2)
      );
      
      return (
        <Circle
          cx={startPoint.x}
          cy={startPoint.y}
          r={radius}
          color={currentColor}
          style="stroke"
          strokeWidth={strokeWidth}
        />
      );
    }

    if (currentTool === 'line') {
      return (
        <Line
          p1={{ x: startPoint.x, y: startPoint.y }}
          p2={{ x: currentPoint.x, y: currentPoint.y }}
          color={currentColor}
          strokeWidth={strokeWidth}
        />
      );
    }

    return null;
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <SkiaCanvas style={styles.canvas}>
          {elements.map((element, index) => {
            if (element.type === 'path') {
              return (
                <Path
                  key={index}
                  path={element.path}
                  color={element.color}
                  style="stroke"
                  strokeWidth={element.strokeWidth}
                />
              );
            }
            
            if (element.type === 'circle') {
              return (
                <Circle
                  key={index}
                  cx={element.centerX}
                  cy={element.centerY}
                  r={element.radius}
                  color={element.color}
                  style="stroke"
                  strokeWidth={element.strokeWidth}
                />
              );
            }
            
            if (element.type === 'rectangle') {
              return (
                <Rect
                  key={index}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  color={element.color}
                  style="stroke"
                  strokeWidth={element.strokeWidth}
                />
              );
            }
            
            if (element.type === 'line') {
              return (
                <Line
                  key={index}
                  p1={{ x: element.startX, y: element.startY }}
                  p2={{ x: element.endX, y: element.endY }}
                  color={element.color}
                  strokeWidth={element.strokeWidth}
                />
              );
            }
            
            return null;
          })}
          
          {currentPath && (
            <Path
              path={currentPath}
              color={currentColor}
              style="stroke"
              strokeWidth={strokeWidth}
            />
          )}
          
          {renderPreview()}
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
