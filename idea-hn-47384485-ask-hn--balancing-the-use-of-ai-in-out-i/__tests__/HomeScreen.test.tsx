import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders correctly', () => {
    const { getByText, getByPlaceholderText } = render(<HomeScreen />);

    expect(getByText('AuthentiChat')).toBeTruthy();
    expect(getByText('Analyze message authenticity')).toBeTruthy();
    expect(getByPlaceholderText('Paste your message here...')).toBeTruthy();
    expect(getByText('Paste')).toBeTruthy();
    expect(getByText('Analyze')).toBeTruthy();
  });

  it('updates message state when text is entered', () => {
    const { getByPlaceholderText } = render(<HomeScreen />);
    const input = getByPlaceholderText('Paste your message here...');

    fireEvent.changeText(input, 'Test message');
    expect(input.props.value).toBe('Test message');
  });

  it('analyzes message when analyze button is pressed', async () => {
    const { getByText, getByPlaceholderText } = render(<HomeScreen />);
    const input = getByPlaceholderText('Paste your message here...');
    const analyzeButton = getByText('Analyze');

    fireEvent.changeText(input, 'Test message');
    fireEvent.press(analyzeButton);

    await waitFor(() => {
      expect(getByText('Authenticity Score')).toBeTruthy();
    });
  });
});
