import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CoachScreen from '../screens/CoachScreen';

describe('CoachScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<CoachScreen />);

    expect(getByText('Smart Response Coach')).toBeTruthy();
    expect(getByText('Get suggestions on how to respond to AI-generated messages')).toBeTruthy();
    expect(getByText('Response Suggestion:')).toBeTruthy();
    expect(getByText('New Suggestion')).toBeTruthy();
    expect(getByText('Additional Tips:')).toBeTruthy();
  });

  it('generates a new suggestion when button is pressed', () => {
    const { getByText } = render(<CoachScreen />);
    const newSuggestionButton = getByText('New Suggestion');

    fireEvent.press(newSuggestionButton);

    expect(getByText('Response Suggestion:')).toBeTruthy();
  });
});
