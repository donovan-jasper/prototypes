import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskItem from '../../src/components/TaskItem';
import { Task } from '../../src/types/TaskTypes';

describe('TaskItem', () => {
  const mockTask: Task = {
    id: 1,
    content: 'Test Task',
    type: 'task',
    isCompleted: false,
    isPinned: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    isPremium: false,
  };

  const mockOnComplete = jest.fn();
  const mockOnDelete = jest.fn();

  it('renders task content and checkbox correctly', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} onComplete={mockOnComplete} onDelete={mockOnDelete} />
    );

    expect(getByText('Test Task')).toBeTruthy();
  });

  it('calls onComplete when checkbox is pressed', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} onComplete={mockOnComplete} onDelete={mockOnDelete} />
    );

    fireEvent.press(getByText('Test Task'));
    expect(mockOnComplete).toHaveBeenCalledWith(1);
  });

  it('calls onDelete when delete button is pressed', () => {
    const { getByText } = render(
      <TaskItem task={mockTask} onComplete={mockOnComplete} onDelete={mockOnDelete} />
    );

    fireEvent.press(getByText('×'));
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('displays snooze option for reminder tasks', () => {
    const reminderTask: Task = { ...mockTask, type: 'reminder', dueDate: new Date() };
    const { getByText } = render(
      <TaskItem task={reminderTask} onComplete={mockOnComplete} onDelete={mockOnDelete} />
    );

    expect(getByText('Snooze')).toBeTruthy();
  });
});
