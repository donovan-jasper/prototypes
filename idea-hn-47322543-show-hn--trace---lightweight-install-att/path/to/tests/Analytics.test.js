import React from 'react';
import { render } from '@testing-library/react-native';
import Analytics from '../../components/Analytics';

describe('Analytics', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<Analytics />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('displays install count correctly', () => {
    const { getByText } = render(<Analytics />);
    const installCountText = getByText('Install Count: 0');
    expect(installCountText).toBeTruthy();
  });

  it('displays deep link count correctly', () => {
    const { getByText } = render(<Analytics />);
    const deepLinkCountText = getByText('Deep Link Count: 0');
    expect(deepLinkCountText).toBeTruthy();
  });
});
