import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import DataSourceIntegrator from '../../src/components/DataSourceIntegrator';

describe('DataSourceIntegrator', () => {
  it('renders correctly', () => {
    const { toJSON } = render(<DataSourceIntegrator />);
    expect(toJSON()).toMatchSnapshot();
  });

  it('integrates with data sources when the "Integrate" button is pressed', () => {
    const { getByTestId } = render(<DataSourceIntegrator />);
    const integrateButton = getByTestId('integrateButton');
    fireEvent.press(integrateButton);
    expect(getByTestId('dataSourceList')).toHaveLength(1);
  });
});
