import { useMemoryStore } from '../store/memoryStore';

describe('Memory store', () => {
  it('should add a memory', () => {
    const { addMemory, memories } = useMemoryStore.getState();
    const memory = {
      title: 'Test Memory',
      description: 'This is a test memory',
      trigger_type: 'time',
      trigger_value: new Date().toISOString(),
      completed: false,
    };
    addMemory(memory);
    expect(memories.length).toBeGreaterThan(0);
  });

  it('should toggle complete status', () => {
    const { toggleComplete, memories } = useMemoryStore.getState();
    const memory = memories[0];
    toggleComplete(memory.id);
    const updatedMemory = memories.find((m) => m.id === memory.id);
    expect(updatedMemory.completed).toBe(true);
  });

  it('should snooze a memory', () => {
    const { snoozeMemory, memories } = useMemoryStore.getState();
    const memory = memories[0];
    snoozeMemory(memory.id);
    const updatedMemory = memories.find((m) => m.id === memory.id);
    expect(new Date(updatedMemory.trigger_value).getTime()).toBeGreaterThan(Date.now());
  });

  it('should delete a memory', () => {
    const { deleteMemory, memories } = useMemoryStore.getState();
    const memory = memories[0];
    deleteMemory(memory.id);
    expect(memories.length).toBe(0);
  });
});
