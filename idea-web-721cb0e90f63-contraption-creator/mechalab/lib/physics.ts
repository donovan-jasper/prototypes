import Matter from 'matter-js';
import { PARTS } from './parts';

export const createEngine = () => {
  const engine = Matter.Engine.create();
  engine.gravity.y = 0.98; // Earth gravity
  return engine;
};

export const addPart = (engine: Matter.Engine, partType: string, position: { x: number; y: number }) => {
  const partConfig = PARTS[partType];
  if (!partConfig) {
    throw new Error(`Unknown part type: ${partType}`);
  }

  let body: Matter.Body;

  switch (partConfig.shape) {
    case 'rectangle':
      body = Matter.Bodies.rectangle(position.x, position.y, 100, 20, {
        isStatic: partType === 'RAMP',
        angle: partType === 'RAMP' ? Math.PI / 6 : 0,
        label: partType,
        friction: partConfig.friction,
        restitution: partConfig.restitution,
        density: partConfig.mass > 0 ? partConfig.mass / 2000 : 0,
      });
      break;
    case 'circle':
      const radius = partType === 'BALL' ? 20 : 30;
      body = Matter.Bodies.circle(position.x, position.y, radius, {
        label: partType,
        friction: partConfig.friction,
        restitution: partConfig.restitution,
        density: partConfig.mass > 0 ? partConfig.mass / (Math.PI * radius * radius) : 0,
      });
      break;
    default:
      body = Matter.Bodies.rectangle(position.x, position.y, 50, 50, {
        label: partType,
        friction: partConfig.friction,
        restitution: partConfig.restitution,
        density: partConfig.mass > 0 ? partConfig.mass / 2500 : 0,
      });
  }

  Matter.World.add(engine.world, [body]);
  return body;
};

export const removePart = (engine: Matter.Engine, body: Matter.Body) => {
  Matter.World.remove(engine.world, body);
};

const FIXED_TIMESTEP = 16.666; // 60fps in milliseconds

export const runSimulation = (engine: Matter.Engine, deltaTime: number) => {
  Matter.Engine.update(engine, FIXED_TIMESTEP);
};
