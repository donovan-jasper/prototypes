import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { Svg, Rect, Circle, Polygon } from 'react-native-svg';
import Matter from 'matter-js';
import { useStore } from '../lib/store';
import { createEngine, addPart, runSimulation } from '../lib/physics';

const Canvas = React.forwardRef((props, ref) => {
  const { parts, isPlaying } = useStore();
  const engineRef = useRef(null);
  const bodiesRef = useRef([]);
  const lastTimeRef = useRef(0);

  useEffect(() => {
    const engine = createEngine();
    engineRef.current = engine;

    // Add existing parts to the engine
    parts.forEach((part) => {
      const body = addPart(engine, part.type, part.position);
      bodiesRef.current.push(body);
    });

    // Animation loop
    const animate = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (isPlaying) {
        runSimulation(engine, deltaTime);
      }

      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);

    return () => {
      Matter.Engine.clear(engine);
    };
  }, [parts, isPlaying]);

  const renderBody = (body) => {
    const { position, vertices, circleRadius, label } = body;
    const color = label === 'RAMP' ? '#6200ee' : '#03dac6';

    if (circleRadius) {
      return (
        <Circle
          key={body.id}
          cx={position.x}
          cy={position.y}
          r={circleRadius}
          fill={color}
        />
      );
    } else {
      const points = vertices.map((v) => `${v.x},${v.y}`).join(' ');
      return <Polygon key={body.id} points={points} fill={color} />;
    }
  };

  return (
    <View style={styles.container} ref={ref}>
      <Svg style={styles.svg}>
        {engineRef.current && engineRef.current.world.bodies.map(renderBody)}
      </Svg>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  svg: {
    flex: 1,
  },
});

export default Canvas;
