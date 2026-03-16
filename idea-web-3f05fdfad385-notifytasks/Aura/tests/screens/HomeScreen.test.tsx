import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HomeScreen from '../../src/screens/HomeScreen';
import { TaskProvider } from '../../src/context/TaskContext';
import { TaskService } from '../../src/services/TaskService';

jest.mock('../../src/services/TaskService');

describe('HomeScreen', () => {
  const mockTasks = [
    {
      id: 1,
      content: 'Task 1',
      type: 'task',
      isCompleted: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPremium: false,
    },
    {
      id: 2,
      content: 'Task 2',
      type: 'task',
      isCompleted: false,
      isPinned: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      isPremium: false,
    },
  ];

  beforeEach(() => {
    (TaskService.getTasks as jest.Mock).mockResolvedValue(mockTasks);
  });

  it('renders list of tasks fetched from TaskService', async () => {
    const { findByText } = render(
      <TaskProvider>
        <HomeScreen />
      </TaskProvider>
    );

    expect(await findByText('Task 1')).toBeTruthy();
    expect(await findByText('Task 2')).toBeTruthy();
  });

  it('allows adding a new task via input field', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(
      <TaskProvider>
        <HomeScreen />
      </TaskProvider>
    );

    const input = getByPlaceholderText('Add a new task...');
    const addButton = getByText('Add');

    fireEvent.changeText(input, 'New Task');
    fireEvent.press(addButton);

    expect(await findByText('New Task')).toBeTruthy();
  });

  it('displays premium upgrade prompt when free limits are reached', async () => {
    const { findByText } = render(
      <TaskProvider>
        <HomeScreen />
      </TaskProvider>
    );

    expect(await findByText('Upgrade to Premium to pin more tasks to your widgets!')).toBeTruthy();
  });
});
