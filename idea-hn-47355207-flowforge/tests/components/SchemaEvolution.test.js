import React from 'react';
import { render } from '@testing-library/react-native';
import SchemaEvolution from '../../src/components/SchemaEvolution';

describe('SchemaEvolution', () => {
  it('renders correctly', () => {
    const { getByText } = render(<SchemaEvolution />);
    expect(getByText('Schema Evolution')).toBeTruthy();
  });
});
