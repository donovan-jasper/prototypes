import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import WorkflowBuilder from '../../src/components/WorkflowBuilder';

describe('WorkflowBuilder', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<WorkflowBuilder />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('adds a new step when the "+" button is pressed', () => {
    const { getByTestId } = render(<WorkflowBuilder />);
    const addButton = getByTestId('addStepButton');
    fireEvent.press(addButton);
    expect(getByTestId('stepList')).toHaveLength(1);
  });
});
