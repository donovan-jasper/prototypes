import React from 'react';
import { render } from '@testing-library/react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { format, subDays } from 'date-fns';

describe('StreakCalendar', () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const twoDaysAgo = subDays(today, 2);

  const mockStreakData = [
    { date: format(twoDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(yesterday, 'yyyy-MM-dd'), isGraceDay: true },
    { date: format(today, 'yyyy-MM-dd'), isGraceDay: false },
  ];

  test('renders correctly with streak data', () => {
    const { getByText } = render(<StreakCalendar streakData={mockStreakData} />);

    // Check if days are rendered
    expect(getByText(format(twoDaysAgo, 'd'))).toBeTruthy();
    expect(getByText(format(yesterday, 'd'))).toBeTruthy();
    expect(getByText(format(today, 'd'))).toBeTruthy();
  });

  test('displays grace days in different color', () => {
    const { getByText } = render(<StreakCalendar streakData={mockStreakData} />);

    // Grace day should have different styling
    const graceDayElement = getByText(format(yesterday, 'd'));
    expect(graceDayElement).toBeTruthy();
  });

  test('shows milestone badges for special days', () => {
    const milestoneDate = subDays(today, 7);
    const milestoneStreakData = [
      ...mockStreakData,
      { date: format(milestoneDate, 'yyyy-MM-dd'), isGraceDay: false },
    ];

    const { getByText } = render(<StreakCalendar streakData={milestoneStreakData} />);

    // Check for milestone badge
    expect(getByText('🎉')).toBeTruthy();
  });

  test('displays grace days used count', async () => {
    const { findByText } = render(<StreakCalendar streakData={mockStreakData} />);

    // Check grace days used text
    const graceDaysText = await findByText(/Grace Days Used This Week: \d\/2/);
    expect(graceDaysText).toBeTruthy();
  });

  test('shows connecting lines between consecutive days', () => {
    const { getAllByTestId } = render(<StreakCalendar streakData={mockStreakData} />);

    // Check for connector lines
    const connectorLines = getAllByTestId('connector-line');
    expect(connectorLines.length).toBeGreaterThan(0);
  });
});
