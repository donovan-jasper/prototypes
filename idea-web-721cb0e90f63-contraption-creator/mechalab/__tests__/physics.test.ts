import { createEngine, addPart, runSimulation } from '../lib/physics';

describe('Physics Engine', () => {
  it('creates a Matter.js engine', () => {
    const engine = createEngine();
    expect(engine).toBeDefined();
    expect(engine.world).toBeDefined();
  });

  it('adds a ramp to the world', () => {
    const engine = createEngine();
    const ramp = addPart(engine, 'RAMP', { x: 100, y: 100 });
    expect(ramp).toBeDefined();
    expect(engine.world.bodies).toContain(ramp);
  });

  it('simulates gravity on a ball', () => {
    const engine = createEngine();
    const ball = addPart(engine, 'BALL', { x: 100, y: 0 });
    const initialY = ball.position.y;
    runSimulation(engine, 1000); // 1 second
    expect(ball.position.y).toBeGreaterThan(initialY);
  });
});
