import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { Svg, Rect, Circle, Polygon } from 'react-native-svg';
import Matter from 'matter-js';
import { useStore } from '../lib/store';
import { createEngine, addPart, removePart, runSimulation } from '../lib/physics';
import { PARTS } from '../lib/parts';

interface InitialPosition {
  position: { x: number; y: number };
  rotation: number;
}

const Canvas = React.forwardRef((props, ref) => {
  const { parts, isPlaying, selectedPart, addPart: addPartToStore, removePart: removePartFromStore, updatePart } = useStore();
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodiesMapRef = useRef<Map<string, Matter.Body>>(new Map());
  const initialPositionsRef = useRef<Map<string, InitialPosition>>(new Map());
  const lastTimeRef = useRef(0);
  const accumulatedTimeRef = useRef(0);
  const [, forceUpdate] = useState({});
  const draggedPartRef = useRef<string | null>(null);
  const initialScaleRef = useRef<number>(1);
  const wasPlayingRef = useRef(false);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;

    // Add existing parts to the engine
    parts.forEach((part) => {
      const body = addPart(engine, part.type, part.position);
      body.angle = part.rotation;
      Matter.Body.scale(body, part.scale, part.scale);
      bodiesMapRef.current.set(part.id, body);
      
      // Store initial positions
      initialPositionsRef.current.set(part.id, {
        position: { x: part.position.x, y: part.position.y },
        rotation: part.rotation,
      });
    });

    return () => {
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
    };
  }, []);

  // Store initial positions when play starts
  useEffect(() => {
    if (isPlaying && !wasPlayingRef.current) {
      // Just started playing - store current positions as initial
      parts.forEach((part) => {
        initialPositionsRef.current.set(part.id, {
          position: { x: part.position.x, y: part.position.y },
          rotation: part.rotation,
        });
      });
    }
    wasPlayingRef.current = isPlaying;
  }, [isPlaying, parts]);

  useEffect(() => {
    let animationFrameId: number;
    const FIXED_TIMESTEP = 16.666;
    
    const animate = (time: number) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (isPlaying && engineRef.current) {
        accumulatedTimeRef.current += deltaTime;
        
        // Run simulation with fixed timestep, accumulating extra time
        while (accumulatedTimeRef.current >= FIXED_TIMESTEP) {
          runSimulation(engineRef.current, FIXED_TIMESTEP);
          accumulatedTimeRef.current -= FIXED_TIMESTEP;
        }
        
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
  }, [isPlaying]);

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
        
        // Store initial position for new parts
        initialPositionsRef.current.set(part.id, {
          position: { x: part.position.x, y: part.position.y },
          rotation: part.rotation,
        });
      }
    });

    // Remove deleted parts
    const partIds = new Set(parts.map(p => p.id));
    bodiesMapRef.current.forEach((body, id) => {
      if (!partIds.has(id)) {
        removePart(engineRef.current!, body);
        bodiesMapRef.current.delete(id);
        initialPositionsRef.current.delete(id);
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
      
      // Store initial position for new part
      initialPositionsRef.current.set(newPart.id, {
        position: { x: event.x, y: event.y },
        rotation: 0,
      });
      
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
        
        // Sync position back to store when manually dragging
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
                  initialPositionsRef.current.delete(partId);
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

  // Expose reset function
  React.useImperativeHandle(ref, () => ({
    reset: () => {
      if (!engineRef.current) return;
      
      // Reset all bodies to their initial positions
      bodiesMapRef.current.forEach((body, partId) => {
        const initial = initialPositionsRef.current.get(partId);
        if (initial) {
          Matter.Body.setPosition(body, initial.position);
          Matter.Body.setAngle(body, initial.rotation);
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
          
          // Sync back to store
          updatePart(partId, {
            position: initial.position,
            rotation: initial.rotation,
          });
        }
      });
      
      forceUpdate({});
    },
  }));

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
