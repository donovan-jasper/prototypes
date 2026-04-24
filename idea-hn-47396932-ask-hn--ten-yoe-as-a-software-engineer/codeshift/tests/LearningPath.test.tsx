import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import LearningPathCard from '../components/LearningPathCard';

test('renders learning path with progress', () => {
  const { getByText } = render(<LearningPathCard title="Python → TensorFlow" progress={50} />);
  expect(getByText('50% Complete')).toBeTruthy();
});
