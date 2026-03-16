import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ReminderCard from '../../components/ReminderCard';

describe('ReminderCard', () => {
  const mockToggleReminder = jest.fn();
  const reminder = { id: '1', title: 'Test Reminder', date: new Date().toISOString(), completed: false };

  test('renders correctly', () => {
    const { getByText } = render(<ReminderCard reminder={reminder} toggleReminder={mockToggleReminder} />);
    expect(getByText('Test Reminder')).toBeTruthy();
  });

  test('calls toggleReminder when pressed', () => {
    const { getByText } = render(<ReminderCard reminder={reminder} toggleReminder={mockToggleReminder} />);
    fireEvent.press(getByText('Test Reminder'));
    expect(mockToggleReminder).toHaveBeenCalledWith('1');
  });
});
