import React from 'react';
import { render } from '@testing-library/react-native';
import ThemeSelector from '../../src/components/ThemeSelector';

describe('ThemeSelector', () => {
  it('renders theme options', () => {
    const { getByText } = render(<ThemeSelector />);
    expect(getByText('Theme:')).toBeTruthy();
    expect(getByText('Retro')).toBeTruthy();
    expect(getByText('Modern')).toBeTruthy();
  });
});
