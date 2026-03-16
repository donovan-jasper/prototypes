import React from 'react';
import { render } from '@testing-library/react-native';
import BuildCanvas from '@/components/BuildCanvas';

describe('BuildCanvas', () => {
  test('renders correctly with no build', () => {
    const { getByText } = render(<BuildCanvas />);
    expect(getByText('No build selected')).toBeTruthy();
  });

  test('renders components when build is provided', () => {
    const build = {
      id: 1,
      name: 'Test Build',
      components: [
        { id: 1, name: 'Turntable', type: 'turntable', brand: 'Brand X', price: 299.99, specs: {} },
        { id: 2, name: 'Amplifier', type: 'amplifier', brand: 'Brand Y', price: 399.99, specs: {} }
      ]
    };
    const { getByText } = render(<BuildCanvas build={build} />);
    expect(getByText('Turntable')).toBeTruthy();
    expect(getByText('Amplifier')).toBeTruthy();
  });
});
