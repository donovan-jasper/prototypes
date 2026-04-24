import { createTask } from '../app/utils/api';

test('creates a task', async () => {
  const task = { title: 'Test Task', description: 'Test Description' };
  const response = await createTask(task);
  expect(response).toEqual({ id: 1, ...task });
});
