import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import VoiceInput from '../components/VoiceInput';

jest.mock('../hooks/useVoiceRecognition', () => ({
  __esModule: true,
  default: () => ({
    isListening: false,
    transcript: '',
    startListening: jest.fn(),
    stopListening: jest.fn(),
  }),
}));

describe('VoiceInput', () => {
  it('renders correctly', () => {
    const { getByText } = render(<VoiceInput onSpeechResults={jest.fn()} />);
    expect(getByText('Start Listening')).toBeTruthy();
  });

  it('calls startListening when button is pressed', () => {
    const mockStartListening = jest.fn();
    jest.mock('../hooks/useVoiceRecognition', () => ({
      __esModule: true,
      default: () => ({
        isListening: false,
        transcript: '',
        startListening: mockStartListening,
        stopListening: jest.fn(),
      }),
    }));

    const { getByText } = render(<VoiceInput onSpeechResults={jest.fn()} />);
    fireEvent.press(getByText('Start Listening'));
    expect(mockStartListening).toHaveBeenCalled();
  });
});
