import { autoCategorizeTask } from '../utils/task-organizer';

describe('Task Organizer', () => {
  it('auto-categorizes tasks based on keywords', () => {
    const task = { title: "Buy milk", notes: "Grocery store" };
    expect(autoCategorizeTask(task)).toEqual({ ...task, category: 'Shopping' });
  });

  it('defaults to General category if no keywords match', () => {
    const task = { title: "Walk the dog", notes: "At the park" };
    expect(autoCategorizeTask(task)).toEqual({ ...task, category: 'General' });
  });
});
