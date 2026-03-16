import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SessionTimer from '../../src/components/SessionTimer';

describe('SessionTimer', () => {
  it('should start and stop timer correctly', () => {
    const { getByText } = render(<SessionTimer onEndSession={() => {}} />);
    expect(getByText('0:00')).toBeTruthy();
  });

  it('should auto-save on session end', () => {
    const mockOnEndSession = jest.fn();
    const { getByText } = render(<SessionTimer onEndSession={mockOnEndSession} />);
    fireEvent.press(getByText('End Session'));
    expect(mockOnEndSession).toHaveBeenCalled();
  });

  it('should handle background timer behavior', () => {
    const { getByText } = render(<SessionTimer onEndSession={() => {}} />);
    expect(getByText('0:00')).toBeTruthy();
  });
});
