import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CallScreen from '../../screens/CallScreen';

describe('CallScreen', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<CallScreen />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('screens calls correctly', () => {
    const { getByText } = render(<CallScreen />);
    const screenCallButton = getByText('Screen Call');
    fireEvent.press(screenCallButton);
    expect(getByText('Call screened successfully')).toBeTruthy();
  });
});
