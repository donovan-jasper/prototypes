import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ProjectTemplate from '../components/ProjectTemplate';

test('renders project template', () => {
  const { getByText } = render(<ProjectTemplate title="Deploy a TinyML model on ESP32" />);
  expect(getByText('Deploy a TinyML model on ESP32')).toBeTruthy();
});
