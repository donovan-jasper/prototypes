import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VoiceInput from '../../app/components/VoiceInput';
import * as Speech from 'expo-speech';

jest.mock('expo-speech', () => ({
  startListening: jest.fn(() => ({
    stop: jest.fn(),
  })),
  stopListening: jest.fn(),
}));

describe('VoiceInput', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders VoiceInput component', () => {
    const { getByTestId } = render(<VoiceInput onSpeechResults={() => {}} />);
    expect(getByTestId('mic-button')).toBeTruthy();
  });

  test('starts and stops listening when button is pressed', async () => {
    const { getByTestId, getByText } = render(<VoiceInput onSpeechResults={() => {}} />);
    const button = getByTestId('mic-button');

    fireEvent.press(button);
    expect(Speech.startListening).toHaveBeenCalled();
    expect(getByText('Listening...')).toBeTruthy();

    fireEvent.press(button);
    expect(Speech.stopListening).toHaveBeenCalled();
  });

  test('displays recognized text', async () => {
    const mockOnSpeechResults = jest.fn();
    const { getByTestId, getByText } = render(<VoiceInput onSpeechResults={mockOnSpeechResults} />);

    // Mock the speech recognition result
    const mockResult = { text: 'Show me sales last quarter' };
    (Speech.startListening as jest.Mock).mockImplementationOnce((options) => {
      options.onRecognized(mockResult);
      return { stop: jest.fn() };
    });

    fireEvent.press(getByTestId('mic-button'));
    await waitFor(() => {
      expect(mockOnSpeechResults).toHaveBeenCalledWith('Show me sales last quarter');
      expect(getByText('Recognized: Show me sales last quarter')).toBeTruthy();
    });
  });

  test('handles errors gracefully', async () => {
    const { getByTestId, getByText } = render(<VoiceInput onSpeechResults={() => {}} />);

    // Mock an error
    (Speech.startListening as jest.Mock).mockImplementationOnce((options) => {
      options.onError({ message: 'Permission denied' });
      return { stop: jest.fn() };
    });

    fireEvent.press(getByTestId('mic-button'));
    await waitFor(() => {
      expect(getByText('Error: Permission denied')).toBeTruthy();
    });
  });
});
