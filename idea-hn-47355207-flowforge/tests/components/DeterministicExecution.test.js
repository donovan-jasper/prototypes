import React from 'react';
import { render } from '@testing-library/react-native';
import DeterministicExecution from '../../src/components/DeterministicExecution';

describe('DeterministicExecution', () => {
  it('renders correctly', () => {
    const { getByText } = render(<DeterministicExecution />);
    expect(getByText('Deterministic Execution')).toBeTruthy();
  });
});
