import React from 'react';
import { render } from '@testing-library/react-native';
import AnalyticsDashboard from './AnalyticsDashboard';

describe('AnalyticsDashboard', () => {
  test('renders streak count', () => {
    const { getByText } = render(
      <AnalyticsDashboard categoryId={1} entries={[]} />
    );
    expect(getByText(/streak/i)).toBeTruthy();
  });
});
