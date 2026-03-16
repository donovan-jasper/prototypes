import { render, fireEvent } from '@testing-library/react-native';
import VoiceInput from '../../app/components/VoiceInput';

test('renders VoiceInput component', () => {
  const { getByText } = render(<VoiceInput onSpeechResults={() => {}} />);
  expect(getByText('Start Listening')).toBeTruthy();
});

test('changes button text when listening', () => {
  const { getByText } = render(<VoiceInput onSpeechResults={() => {}} />);
  fireEvent.press(getByText('Start Listening'));
  expect(getByText('Listening...')).toBeTruthy();
});
