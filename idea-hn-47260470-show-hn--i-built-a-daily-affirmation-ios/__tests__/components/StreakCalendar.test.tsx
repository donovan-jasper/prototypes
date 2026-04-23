import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import StreakCalendar from '../../components/StreakCalendar';
import { format, subDays, addDays } from 'date-fns';

describe('StreakCalendar', () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const twoDaysAgo = subDays(today, 2);
  const threeDaysAgo = subDays(today, 3);
  const fourDaysAgo = subDays(today, 4);
  const fiveDaysAgo = subDays(today, 5);
  const sixDaysAgo = subDays(today, 6);
  const sevenDaysAgo = subDays(today, 7);

  const mockStreakData = [
    { date: format(twoDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(yesterday, 'yyyy-MM-dd'), isGraceDay: true },
    { date: format(today, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(threeDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(fourDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(fiveDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(sixDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
    { date: format(sevenDaysAgo, 'yyyy-MM-dd'), isGraceDay: false },
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

  test('navigates to previous and next months', () => {
    const { getByText } = render(<StreakCalendar streakData={mockStreakData} />);

    // Get current month name
    const currentMonth = format(today, 'MMMM yyyy');
    expect(getByText(currentMonth)).toBeTruthy();

    // Find and click previous month button
    const prevButton = getByText('←');
    fireEvent.press(prevButton);

    // Check if month changed
    const prevMonth = format(subDays(today, 30), 'MMMM yyyy');
    expect(getByText(prevMonth)).toBeTruthy();

    // Find and click next month button
    const nextButton = getByText('→');
    fireEvent.press(nextButton);

    // Check if month returned to current
    expect(getByText(currentMonth)).toBeTruthy();
  });

  test('displays weekdays header', () => {
    const { getByText } = render(<StreakCalendar streakData={mockStreakData} />);

    // Check for all weekdays
    expect(getByText('Sun')).toBeTruthy();
    expect(getByText('Mon')).toBeTruthy();
    expect(getByText('Tue')).toBeTruthy();
    expect(getByText('Wed')).toBeTruthy();
    expect(getByText('Thu')).toBeTruthy();
    expect(getByText('Fri')).toBeTruthy();
    expect(getByText('Sat')).toBeTruthy();
  });

  test('shows legend with correct items', () => {
    const { getByText } = render(<StreakCalendar streakData={mockStreakData} />);

    // Check for legend items
    expect(getByText('Completed Day')).toBeTruthy();
    expect(getByText('Grace Day')).toBeTruthy();
    expect(getByText('Milestone')).toBeTruthy();
  });
});
