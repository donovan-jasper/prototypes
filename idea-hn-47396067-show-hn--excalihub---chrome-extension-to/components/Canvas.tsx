import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Canvas as SkiaCanvas, Path, Skia, useCanvasRef, useTouchHandler } from '@shopify/react-native-skia';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useDrawingStore } from '../store/useDrawingStore';
import { CanvasElement, Cursor } from '../types/drawing';
import { v4 as uuidv4 } from 'uuid';

const { width, height } = Dimensions.get('window');

interface CanvasProps {
  initialElements?: CanvasElement[];
  onElementAdded?: (element: CanvasElement) => void;
  onElementUpdated?: (id: string, updates: Partial<CanvasElement>) => void;
  onElementRemoved?: (id: string) => void;
  onCursorMove?: (x: number, y: number) => void;
  cursors?: Record<string, Cursor>;
  activeUsers?: Array<{ id: string; name: string; color: string }>;
  isReadOnly?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  initialElements = [],
  onElementAdded,
  onElementUpdated,
  onElementRemoved,
  onCursorMove,
  cursors = {},
  activeUsers = [],
  isReadOnly = false,
}) => {
  const canvasRef = useCanvasRef();
  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [currentPath, setCurrentPath] = useState<Path | null>(null);
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, scale: 1 });
  const [isDrawing, setIsDrawing] = useState(false);

  const {
    currentTool,
    currentColor,
    currentStrokeWidth,
    addElement,
    updateElement,
    removeElement,
  } = useDrawingStore();

  // Initialize with initial elements
  useEffect(() => {
    setElements(initialElements);
  }, [initialElements]);

  // Handle element changes from collaboration
  useEffect(() => {
    if (onElementAdded || onElementUpdated || onElementRemoved) {
      // This would be handled by the parent component in a real implementation
    }
  }, [onElementAdded, onElementUpdated, onElementRemoved]);

  const handleTouchStart = (x: number, y: number) => {
    if (isReadOnly) return;

    setIsDrawing(true);
    onCursorMove?.(x, y);

    if (currentTool === 'pen') {
      const path = Skia.Path.Make();
      path.moveTo(x, y);
      setCurrentPath(path);

      const newElement: CanvasElement = {
        id: uuidv4(),
        type: 'path',
        path: path.toSVGString(),
        color: currentColor,
        strokeWidth: currentStrokeWidth,
        points: [{ x, y }],
      };

      setCurrentElement(newElement);
      setElements(prev => [...prev, newElement]);
      onElementAdded?.(newElement);
    }
  };

  const handleTouchMove = (x: number, y: number) => {
    if (!isDrawing || isReadOnly) return;

    onCursorMove?.(x, y);

    if (currentTool === 'pen' && currentPath && currentElement) {
      currentPath.lineTo(x, y);

      const updatedElement = {
        ...currentElement,
        path: currentPath.toSVGString(),
        points: [...currentElement.points, { x, y }],
      };

      setCurrentElement(updatedElement);
      setElements(prev => prev.map(el =>
        el.id === updatedElement.id ? updatedElement : el
      ));
      onElementUpdated?.(updatedElement.id, {
        path: updatedElement.path,
        points: updatedElement.points,
      });
    }
  };

  const handleTouchEnd = () => {
    if (!isDrawing || isReadOnly) return;

    setIsDrawing(false);
    setCurrentPath(null);
    setCurrentElement(null);
  };

  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => handleTouchStart(x, y),
    onActive: ({ x, y }) => handleTouchMove(x, y),
    onEnd: () => handleTouchEnd(),
  });

  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      setViewport(prev => ({
        ...prev,
        x: prev.x + e.translationX / prev.scale,
        y: prev.y + e.translationY / prev.scale,
      }));
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      setViewport(prev => ({
        ...prev,
        scale: prev.scale * e.scale,
      }));
    });

  const composedGesture = Gesture.Simultaneous(panGesture, pinchGesture);

  const renderElement = (element: CanvasElement) => {
    switch (element.type) {
      case 'path':
        return (
          <Path
            key={element.id}
            path={element.path}
            color={element.color}
            style="stroke"
            strokeWidth={element.strokeWidth}
          />
        );
      // Add cases for other element types (rect, circle, etc.)
      default:
        return null;
    }
  };

  const renderCursor = (cursor: Cursor, user: { id: string; color: string }) => {
    return (
      <View
        key={`cursor-${user.id}`}
        style={[
          styles.cursor,
          {
            left: cursor.x,
            top: cursor.y,
            borderColor: user.color,
          },
        ]}
      />
    );
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container}>
        <SkiaCanvas
          ref={canvasRef}
          style={styles.canvas}
          onTouch={touchHandler}
        >
          {elements.map(renderElement)}
        </SkiaCanvas>

        {/* Render remote cursors */}
        {Object.entries(cursors).map(([userId, cursor]) => {
          const user = activeUsers.find(u => u.id === userId);
          return user ? renderCursor(cursor, user) : null;
        })}
      </View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  cursor: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 10,
    pointerEvents: 'none',
  },
});

export default Canvas;
