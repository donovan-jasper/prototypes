import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HabitCard from '../../components/HabitCard';

describe('HabitCard', () => {
  const mockToggleHabit = jest.fn();
  const habit = { id: '1', title: 'Test Habit', streak: 0, completed: false };

  test('renders correctly', () => {
    const { getByText } = render(<HabitCard habit={habit} toggleHabit={mockToggleHabit} />);
    expect(getByText('Test Habit')).toBeTruthy();
  });

  test('calls toggleHabit when pressed', () => {
    const { getByText } = render(<HabitCard habit={habit} toggleHabit={mockToggleHabit} />);
    fireEvent.press(getByText('Test Habit'));
    expect(mockToggleHabit).toHaveBeenCalledWith('1');
  });
});
