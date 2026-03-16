import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TaskCard } from '@/components/TaskCard';

describe('TaskCard', () => {
  it('should render task details', () => {
    const task = {
      id: '1',
      type: 'organize_photos',
      status: 'completed',
      filesProcessed: 42,
      createdAt: Date.now(),
    };

    const { getByText } = render(<TaskCard task={task} />);
    expect(getByText('Organize Photos')).toBeTruthy();
    expect(getByText('42 files processed')).toBeTruthy();
  });

  it('should call onCancel when cancel button pressed', () => {
    const onCancel = jest.fn();
    const task = { id: '1', type: 'test', status: 'pending' };

    const { getByText } = render(<TaskCard task={task} onCancel={onCancel} />);
    fireEvent.press(getByText('Cancel'));

    expect(onCancel).toHaveBeenCalledWith('1');
  });
});
