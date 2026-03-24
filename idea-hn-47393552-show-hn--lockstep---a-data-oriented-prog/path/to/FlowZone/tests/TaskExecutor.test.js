import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import TaskExecutor from '../../src/components/TaskExecutor';

describe('TaskExecutor', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<TaskExecutor />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('executes tasks when the "Execute" button is pressed', () => {
    const { getByTestId } = render(<TaskExecutor />);
    const executeButton = getByTestId('executeButton');
    fireEvent.press(executeButton);
    expect(getByTestId('taskList')).toHaveLength(1);
  });
});
