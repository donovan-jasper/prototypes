import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Svg, Rect, Circle, Polygon } from 'react-native-svg';
import Matter from 'matter-js';
import { useStore } from '../lib/store';
import { createEngine, addPart, removePart, runSimulation } from '../lib/physics';
import { PARTS } from '../lib/parts';

const Canvas = React.forwardRef((props, ref) => {
  const { parts, isPlaying, selectedPart, addPart: addPartToStore, removePart: removePartFromStore, updatePart } = useStore();
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
  const lastTimeRef = useRef(0);
  const [, forceUpdate] = useState({});
  const draggedPartRef = useRef<string | null>(null);
  const initialScaleRef = useRef<number>(1);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;

    // Add existing parts to the engine
    parts.forEach((part) => {
      const body = addPart(engine, part.type, part.position);
      body.angle = part.rotation;
      Matter.Body.scale(body, part.scale, part.scale);
      bodiesMapRef.current.set(part.id, body);
    });

    return () => {
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (isPlaying && engineRef.current) {
        runSimulation(engineRef.current, deltaTime);
        
        // Sync physics bodies back to store
        bodiesMapRef.current.forEach((body, partId) => {
          const part = parts.find(p => p.id === partId);
          if (part) {
            const positionChanged = 
              Math.abs(body.position.x - part.position.x) > 0.1 ||
              Math.abs(body.position.y - part.position.y) > 0.1;
            const rotationChanged = Math.abs(body.angle - part.rotation) > 0.01;
            
            if (positionChanged || rotationChanged) {
              updatePart(partId, {
                position: { x: body.position.x, y: body.position.y },
                rotation: body.angle,
              });
            }
          }
        });
        
        forceUpdate({});
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, parts]);

  // Sync store changes to physics bodies
  useEffect(() => {
    if (!engineRef.current) return;

    // Add new parts
    parts.forEach((part) => {
      if (!bodiesMapRef.current.has(part.id)) {
        const body = addPart(engineRef.current!, part.type, part.position);
        body.angle = part.rotation;
        Matter.Body.scale(body, part.scale, part.scale);
        bodiesMapRef.current.set(part.id, body);
      }
    });

    // Remove deleted parts
    const partIds = new Set(parts.map(p => p.id));
    bodiesMapRef.current.forEach((body, id) => {
      if (!partIds.has(id)) {
        removePart(engineRef.current!, body);
        bodiesMapRef.current.delete(id);
      }
    });
  }, [parts.length]);

  const findBodyAtPoint = (x: number, y: number): string | null => {
    if (!engineRef.current) return null;
    
    const bodies = Matter.Query.point(engineRef.current.world.bodies, { x, y });
    if (bodies.length > 0) {
      for (const [id, body] of bodiesMapRef.current.entries()) {
        if (bodies.includes(body)) {
          return id;
        }
      }
    }
    return null;
  };

  const tapGesture = Gesture.Tap()
    .onEnd((event) => {
      if (!selectedPart || !engineRef.current) return;

      const newPart = {
        id: `part-${Date.now()}-${Math.random()}`,
        type: selectedPart,
        position: { x: event.x, y: event.y },
        scale: 1,
        rotation: 0,
      };

      const body = addPart(engineRef.current, selectedPart, { x: event.x, y: event.y });
      bodiesMapRef.current.set(newPart.id, body);
      addPartToStore(newPart);
    });

  const panGesture = Gesture.Pan()
    .onStart((event) => {
      const partId = findBodyAtPoint(event.x, event.y);
      if (partId) {
        draggedPartRef.current = partId;
      }
    })
    .onUpdate((event) => {
      if (!draggedPartRef.current || !engineRef.current) return;

      const body = bodiesMapRef.current.get(draggedPartRef.current);
      if (body) {
        Matter.Body.setPosition(body, { x: event.x, y: event.y });
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
        Matter.Body.setAngularVelocity(body, 0);
        updatePart(draggedPartRef.current, { position: { x: event.x, y: event.y } });
        forceUpdate({});
      }
    })
    .onEnd(() => {
      draggedPartRef.current = null;
    });

  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart((event) => {
      const partId = findBodyAtPoint(event.x, event.y);
      if (partId) {
        Alert.alert(
          'Delete Part',
          'Do you want to delete this part?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                const body = bodiesMapRef.current.get(partId);
                if (body && engineRef.current) {
                  removePart(engineRef.current, body);
                  bodiesMapRef.current.delete(partId);
                  removePartFromStore(partId);
                }
              },
            },
          ]
        );
      }
    });

  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      const partId = findBodyAtPoint(event.focalX, event.focalY);
      if (partId) {
        draggedPartRef.current = partId;
        const currentPart = parts.find(p => p.id === partId);
        initialScaleRef.current = currentPart?.scale || 1;
      }
    })
    .onUpdate((event) => {
      if (!draggedPartRef.current) return;

      const body = bodiesMapRef.current.get(draggedPartRef.current);
      if (body) {
        const currentPart = parts.find(p => p.id === draggedPartRef.current);
        if (currentPart) {
          const newScale = initialScaleRef.current * event.scale;
          const scaleFactor = newScale / currentPart.scale;
          
          Matter.Body.scale(body, scaleFactor, scaleFactor);
          updatePart(draggedPartRef.current, { scale: newScale });
          forceUpdate({});
        }
      }
    })
    .onEnd(() => {
      draggedPartRef.current = null;
      initialScaleRef.current = 1;
    });

  const composedGesture = Gesture.Race(
    longPressGesture,
    Gesture.Simultaneous(tapGesture, panGesture, pinchGesture)
  );

  const renderBody = (body: Matter.Body, partId: string) => {
    const { position, vertices, circleRadius, label } = body;
    const partConfig = PARTS[label];
    const color = partConfig?.color || '#6200ee';

    if (circleRadius) {
      return (
        <Circle
          key={partId}
          cx={position.x}
          cy={position.y}
          r={circleRadius}
          fill={color}
        />
      );
    } else {
      const points = vertices.map((v) => `${v.x},${v.y}`).join(' ');
      return <Polygon key={partId} points={points} fill={color} />;
    }
  };

  return (
    <GestureDetector gesture={composedGesture}>
      <View style={styles.container} ref={ref}>
        <Svg style={styles.svg}>
          {Array.from(bodiesMapRef.current.entries()).map(([partId, body]) =>
            renderBody(body, partId)
          )}
        </Svg>
      </View>
    </GestureDetector>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  svg: {
    flex: 1,
  },
});

export default Canvas;
