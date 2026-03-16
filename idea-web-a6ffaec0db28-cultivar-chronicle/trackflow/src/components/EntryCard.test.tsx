import React from 'react';
import { render } from '@testing-library/react-native';
import EntryCard from './EntryCard';

describe('EntryCard', () => {
  test('renders entry details', () => {
    const entry = {
      id: 1,
      categoryId: 1,
      timestamp: Date.now(),
      note: 'Morning run',
      photoUri: null,
      weather: 'sunny',
      temperature: 25,
      location: 'San Francisco',
    };

    const { getByText } = render(<EntryCard entry={entry} />);
    expect(getByText('Morning run')).toBeTruthy();
    expect(getByText('sunny')).toBeTruthy();
    expect(getByText('25°C')).toBeTruthy();
  });
});
