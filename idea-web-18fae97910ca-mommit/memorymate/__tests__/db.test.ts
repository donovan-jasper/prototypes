import { initDB, createMemory, getMemories, updateMemory, deleteMemory } from '../lib/db';

describe('Database operations', () => {
  beforeAll(() => {
    initDB();
  });

  it('should create a memory', (done) => {
    const memory = {
      title: 'Test Memory',
      description: 'This is a test memory',
      trigger_type: 'time',
      trigger_value: new Date().toISOString(),
      completed: false,
      user_id: 'user1',
    };

    createMemory(memory, (id) => {
      expect(id).toBeDefined();
      done();
    });
  });

  it('should get memories', (done) => {
    getMemories((memories) => {
      expect(memories.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should update a memory', (done) => {
    getMemories((memories) => {
      const memory = memories[0];
      updateMemory(memory.id, { ...memory, title: 'Updated Memory' }, () => {
        getMemories((updatedMemories) => {
          const updatedMemory = updatedMemories.find((m) => m.id === memory.id);
          expect(updatedMemory.title).toBe('Updated Memory');
          done();
        });
      });
    });
  });

  it('should delete a memory', (done) => {
    getMemories((memories) => {
      const memory = memories[0];
      deleteMemory(memory.id, () => {
        getMemories((remainingMemories) => {
          expect(remainingMemories.length).toBe(memories.length - 1);
          done();
        });
      });
    });
  });
});
