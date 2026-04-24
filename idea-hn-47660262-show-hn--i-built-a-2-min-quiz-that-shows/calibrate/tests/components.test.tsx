import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Quiz from '../src/components/Quiz';

test('Quiz component renders correctly', () => {
  const { getByText } = render(<Quiz />);
  expect(getByText('How many apples are in a dozen?')).toBeTruthy();
});

test('Quiz component handles answer selection', () => {
  const { getByText } = render(<Quiz />);
  fireEvent.press(getByText('12'));
  expect(getByText('What is 2 + 2?')).toBeTruthy();
});
