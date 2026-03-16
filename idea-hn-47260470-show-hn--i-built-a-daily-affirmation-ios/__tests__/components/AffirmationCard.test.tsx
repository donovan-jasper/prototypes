import React from 'react';
import { render } from '@testing-library/react-native';
import AffirmationCard from '../../components/AffirmationCard';

describe('AffirmationCard', () => {
  test('renders affirmation text', () => {
    const affirmation = { text: 'You are amazing' };
    const { getByText } = render(<AffirmationCard affirmation={affirmation} streakCount={5} />);
    expect(getByText('You are amazing')).toBeTruthy();
  });

  test('displays streak count', () => {
    const affirmation = { text: 'Test' };
    const { getByText } = render(<AffirmationCard affirmation={affirmation} streakCount={10} />);
    expect(getByText('Streak: 10 days')).toBeTruthy();
  });
});
