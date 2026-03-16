import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import BigButton from '../../components/BigButton';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('BigButton', () => {
  it('renders correctly', () => {
    const { getByText } = render(
      <SettingsProvider>
        <BigButton icon="phone" label="Call" onPress={() => {}} />
      </SettingsProvider>
    );
    expect(getByText('Call')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SettingsProvider>
        <BigButton icon="phone" label="Call" onPress={onPress} />
      </SettingsProvider>
    );
    fireEvent.press(getByText('Call'));
    expect(onPress).toHaveBeenCalled();
  });
});
