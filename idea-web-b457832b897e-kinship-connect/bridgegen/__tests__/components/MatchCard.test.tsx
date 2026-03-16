import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MatchCard from '../../components/MatchCard';

describe('MatchCard Component', () => {
  const mockMatch = {
    id: '1',
    name: 'Margaret Smith',
    age: 72,
    interests: ['cooking', 'gardening'],
    distance: 5.2,
    compatibilityScore: 85,
  };

  test('renders match information correctly', () => {
    const { getByText } = render(<MatchCard match={mockMatch} onPress={() => {}} />);
    expect(getByText('Margaret Smith')).toBeTruthy();
    expect(getByText('72')).toBeTruthy();
    expect(getByText('5.2 miles away')).toBeTruthy();
  });

  test('calls onPress when card is tapped', () => {
    const onPressMock = jest.fn();
    const { getByTestId } = render(<MatchCard match={mockMatch} onPress={onPressMock} />);
    fireEvent.press(getByTestId('match-card'));
    expect(onPressMock).toHaveBeenCalledWith(mockMatch);
  });
});
