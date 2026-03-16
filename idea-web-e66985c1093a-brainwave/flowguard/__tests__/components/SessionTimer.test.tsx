import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SessionTimer } from '../../src/components/SessionTimer';

describe('SessionTimer', () => {
  test('renders initial state', () => {
    const { getByText } = render(
      <SessionTimer isActive={false} onStart={jest.fn()} onStop={jest.fn()} />
    );
    expect(getByText('00:00:00')).toBeTruthy();
  });

  test('calls onStart when start button pressed', () => {
    const onStart = jest.fn();
    const { getByText } = render(
      <SessionTimer isActive={false} onStart={onStart} onStop={jest.fn()} />
    );

    fireEvent.press(getByText('Start'));
    expect(onStart).toHaveBeenCalled();
  });

  test('displays elapsed time when active', () => {
    const { getByText } = render(
      <SessionTimer
        isActive={true}
        elapsedSeconds={125}
        onStart={jest.fn()}
        onStop={jest.fn()}
      />
    );
    expect(getByText('00:02:05')).toBeTruthy();
  });
});
