import Matter from 'matter-js';

export const createEngine = () => {
  const engine = Matter.Engine.create();
  engine.gravity.y = 0.98; // Earth gravity
  return engine;
};

export const addPart = (engine, partType, position) => {
  let body;

  switch (partType) {
    case 'RAMP':
      body = Matter.Bodies.rectangle(position.x, position.y, 100, 20, {
        isStatic: true,
        angle: Math.PI / 6, // 30 degrees
        label: 'RAMP',
      });
      break;
    case 'BALL':
      body = Matter.Bodies.circle(position.x, position.y, 20, {
        restitution: 0.8,
        friction: 0.01,
        label: 'BALL',
      });
      break;
    case 'WHEEL':
      body = Matter.Bodies.circle(position.x, position.y, 30, {
        restitution: 0.5,
        friction: 0.1,
        label: 'WHEEL',
      });
      break;
    // Add cases for other part types
    default:
      body = Matter.Bodies.rectangle(position.x, position.y, 50, 50, {
        label: partType,
      });
  }

  Matter.World.add(engine.world, [body]);
  return body;
};

export const removePart = (engine, body) => {
  Matter.World.remove(engine.world, body);
};

export const runSimulation = (engine, deltaTime) => {
  Matter.Engine.update(engine, deltaTime);
};
