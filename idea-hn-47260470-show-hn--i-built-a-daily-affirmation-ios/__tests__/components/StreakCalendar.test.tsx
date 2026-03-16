import React from 'react';
import { render } from '@testing-library/react-native';
import StreakCalendar from '../../components/StreakCalendar';

describe('StreakCalendar', () => {
  test('renders streak data', () => {
    const streakData = [
      { date: '2026-03-15', isGraceDay: false },
      { date: '2026-03-16', isGraceDay: true },
    ];
    const { getByText } = render(<StreakCalendar streakData={streakData} />);
    expect(getByText('2026-03-15')).toBeTruthy();
    expect(getByText('2026-03-16')).toBeTruthy();
  });
});
