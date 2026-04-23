import React, { useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { Canvas as SkiaCanvas, Path, Group, Skia, SkPath } from '@shopify/react-native-skia';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useDrawingStore } from '../store/useDrawingStore';
import { CanvasElement } from '../types/drawing';

type CanvasProps = {
  initialElements?: CanvasElement[];
  onElementAdded?: (element: CanvasElement) => void;
  onElementUpdated?: (id: string, updates: Partial<CanvasElement>) => void;
  onElementRemoved?: (id: string) => void;
  onCursorMove?: (x: number, y: number) => void;
  cursors?: Array<{ x: number; y: number; userId: string }>;
  activeUsers?: Array<{ id: string; color: string }>;
};

const Canvas = ({
  initialElements = [],
  onElementAdded,
  onElementUpdated,
  onElementRemoved,
  onCursorMove,
  cursors = [],
  activeUsers = [],
}: CanvasProps) => {
  const {
    elements,
    addElement,
    updateElement,
    removeElement,
    currentTool,
    currentColor,
    currentStrokeWidth,
    setElements,
  } = useDrawingStore();

  const pathRef = useRef<Path>(new Path());
  const currentPathRef = useRef<CanvasElement | null>(null);
  const lastCursorPosition = useRef({ x: 0, y: 0 });

  // Initialize with initial elements
  useEffect(() => {
    if (initialElements.length > 0) {
      setElements(initialElements);
    }
  }, [initialElements, setElements]);

  // Handle drawing
  const panGesture = Gesture.Pan()
    .onStart((e) => {
      if (currentTool === 'pen') {
        const newPath: CanvasElement = {
          id: Math.random().toString(36).substring(2, 9),
          type: 'path',
          path: new Path(),
          color: currentColor,
          strokeWidth: currentStrokeWidth,
          points: [{ x: e.x, y: e.y }],
        };
        newPath.path.moveTo(e.x, e.y);
        currentPathRef.current = newPath;
        addElement(newPath);
        onElementAdded?.(newPath);
      }
    })
    .onUpdate((e) => {
      if (currentTool === 'pen' && currentPathRef.current) {
        const currentPath = currentPathRef.current;
        currentPath.path.lineTo(e.x, e.y);
        currentPath.points.push({ x: e.x, y: e.y });

        updateElement(currentPath.id, {
          path: currentPath.path,
          points: currentPath.points,
        });

        onElementUpdated?.(currentPath.id, {
          path: currentPath.path,
          points: currentPath.points,
        });
      }

      // Throttle cursor updates to avoid too many broadcasts
      if (Math.abs(e.x - lastCursorPosition.current.x) > 5 ||
          Math.abs(e.y - lastCursorPosition.current.y) > 5) {
        onCursorMove?.(e.x, e.y);
        lastCursorPosition.current = { x: e.x, y: e.y };
      }
    })
    .onEnd(() => {
      if (currentTool === 'pen' && currentPathRef.current) {
        currentPathRef.current = null;
      }
    });

  // Render elements
  const renderElement = useCallback((element: CanvasElement) => {
    switch (element.type) {
      case 'path':
        return (
          <Path
            key={element.id}
            path={element.path}
            style="stroke"
            strokeWidth={element.strokeWidth}
            color={element.color}
          />
        );
      // Add cases for other element types (rect, circle, etc.)
      default:
        return null;
    }
  }, []);

  // Render cursors
  const renderCursors = useCallback(() => {
    return cursors.map((cursor) => {
      const user = activeUsers.find(u => u.id === cursor.userId);
      if (!user) return null;

      return (
        <Group key={`cursor-${cursor.userId}`}>
          <Path
            path={Skia.Path.Make()
              .moveTo(cursor.x - 10, cursor.y - 10)
              .lineTo(cursor.x + 10, cursor.y + 10)
              .moveTo(cursor.x + 10, cursor.y - 10)
              .lineTo(cursor.x - 10, cursor.y + 10)}
            style="stroke"
            strokeWidth={2}
            color={user.color}
          />
          <Path
            path={Skia.Path.Make()
              .moveTo(cursor.x, cursor.y)
              .addCircle(cursor.x, cursor.y, 5)}
            style="fill"
            color={user.color}
          />
        </Group>
      );
    });
  }, [cursors, activeUsers]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={panGesture}>
        <SkiaCanvas style={styles.canvas}>
          {elements.map(renderElement)}
          {renderCursors()}
        </SkiaCanvas>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
});

export default Canvas;
