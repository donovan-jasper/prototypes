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

  it('adds field to application', () => {
    const { getByPlaceholderText, getByText } = render(
      <NavigationContainer>
        <ApplicationBuilder />
      </NavigationContainer>
    );
    const fieldNameInput = getByPlaceholderText('Field Name');
    const fieldTypeInput = getByPlaceholderText('Field Type (e.g. String, Number, Boolean)');
    const addFieldButton = getByText('Add Field');
    
    fireEvent.changeText(fieldNameInput, 'Test Field');
    fireEvent.changeText(fieldTypeInput, 'String');
    fireEvent.press(addFieldButton);
    
    expect(getByText('Test Field')).toBeTruthy();
  });

  it('removes field from application', () => {
    const { getByPlaceholderText, getByText, getAllByType } = render(
      <NavigationContainer>
        <ApplicationBuilder />
      </NavigationContainer>
    );
    const fieldNameInput = getByPlaceholderText('Field Name');
    const fieldTypeInput = getByPlaceholderText('Field Type (e.g. String, Number, Boolean)');
    const addFieldButton = getByText('Add Field');
    const removeFieldButton = getAllByType(Button)[1];
    
    fireEvent.changeText(fieldNameInput, 'Test Field');
    fireEvent.changeText(fieldTypeInput, 'String');
    fireEvent.press(addFieldButton);
    fireEvent.press(removeFieldButton);
    
    expect(getByText('Test Field')).toBeFalsy();
  });
});
