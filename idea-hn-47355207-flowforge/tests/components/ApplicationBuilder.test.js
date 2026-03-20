import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import ApplicationBuilder from '../../src/components/ApplicationBuilder';

jest.mock('../../src/services/DatabaseService');

describe('ApplicationBuilder', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <ApplicationBuilder />
      </NavigationContainer>
    );
    expect(getByText('Application Builder')).toBeTruthy();
  });

  it('adds new application to the list', () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ApplicationBuilder />
      </NavigationContainer>
    );
    const input = getByPlaceholderText('New Application Name');
    const button = getByText('Add Application');
    
    fireEvent.changeText(input, 'Test Application');
    fireEvent.press(button);
    
    expect(getByText('Test Application')).toBeTruthy();
  });

  it('saves application', async () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ApplicationBuilder />
      </NavigationContainer>
    );
    const input = getByPlaceholderText('Application Name');
    const button = getByText('Create Application');
    
    fireEvent.changeText(input, 'Test Application');
    fireEvent.press(button);
    
    await waitFor(() => expect(getByText('Test Application')).toBeTruthy());
  });
});
