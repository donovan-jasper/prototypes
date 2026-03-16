import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import VoiceInput from '../../app/components/VoiceInput';

test('renders VoiceInput component', () => {
  const { getByText } = render(<VoiceInput onSpeechResults={() => {}} />);
  expect(getByText('Start Listening')).toBeTruthy();
});

test('changes button text when listening', async () => {
  const { getByText } = render(<VoiceInput onSpeechResults={() => {}} />);
  fireEvent.press(getByText('Start Listening'));
  expect(getByText('Listening...')).toBeTruthy();
  await waitFor(() => expect(getByText('Start Listening')).toBeTruthy(), { timeout: 2000 });
});

test('calls onSpeechResults after listening', async () => {
  const mockOnSpeechResults = jest.fn();
  const { getByText } = render(<VoiceInput onSpeechResults={mockOnSpeechResults} />);
  
  fireEvent.press(getByText('Start Listening'));
  await waitFor(() => expect(mockOnSpeechResults).toHaveBeenCalledWith('Show me sales last quarter'), { timeout: 2000 });
});
