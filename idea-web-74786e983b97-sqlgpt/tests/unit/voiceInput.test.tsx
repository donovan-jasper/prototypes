import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VoiceInput from '../../../app/components/VoiceInput';
import * as Speech from 'expo-speech';

// Mock the entire expo-speech module
jest.mock('expo-speech', () => ({
  startListening: jest.fn(),
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

    // Mock the startListening implementation
    (Speech.startListening as jest.Mock).mockImplementation((options) => {
      // Simulate the onRecognized callback
      if (options.onRecognized) {
        options.onRecognized({ text: 'test' });
      }
      return { stop: jest.fn() };
    });

    fireEvent.press(button);
    expect(Speech.startListening).toHaveBeenCalled();
    expect(getByText('Listening...')).toBeTruthy();

    fireEvent.press(button);
    expect(Speech.stopListening).toHaveBeenCalled();
  });

  test('displays recognized text', async () => {
    const mockOnSpeechResults = jest.fn();
    const { getByTestId, getByText } = render(<VoiceInput onSpeechResults={mockOnSpeechResults} />);

    // Mock the startListening implementation
    (Speech.startListening as jest.Mock).mockImplementation((options) => {
      // Simulate the onRecognized callback with test data
      if (options.onRecognized) {
        options.onRecognized({ text: 'Show me sales last quarter' });
      }
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

    // Mock the startListening implementation to throw an error
    (Speech.startListening as jest.Mock).mockImplementation((options) => {
      if (options.onError) {
        options.onError({ message: 'Permission denied' });
      }
      return { stop: jest.fn() };
    });

    fireEvent.press(getByTestId('mic-button'));
    await waitFor(() => {
      expect(getByText('Error: Permission denied')).toBeTruthy();
    });
  });
});
