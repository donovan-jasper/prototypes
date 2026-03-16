import React from 'react';
import { render } from '@testing-library/react-native';
import StatsCard from '../../src/components/StatsCard';

describe('StatsCard', () => {
  it('should render correctly with given props', () => {
    const { getByText } = render(<StatsCard label="Best Streak" value="10" />);
    expect(getByText('Best Streak')).toBeTruthy();
    expect(getByText('10')).toBeTruthy();
  });

  it('should handle zero sessions gracefully', () => {
    const { getByText } = render(<StatsCard label="Total Shots" value="0" />);
    expect(getByText('Total Shots')).toBeTruthy();
    expect(getByText('0')).toBeTruthy();
  });

  it('should display premium vs free tier correctly', () => {
    const { getByText } = render(<StatsCard label="Highest Accuracy" value="85%" />);
    expect(getByText('Highest Accuracy')).toBeTruthy();
    expect(getByText('85%')).toBeTruthy();
  });
});
