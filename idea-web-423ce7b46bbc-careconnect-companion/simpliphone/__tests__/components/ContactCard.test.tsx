import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ContactCard from '../../components/ContactCard';
import { SettingsProvider } from '../../contexts/SettingsContext';

describe('ContactCard', () => {
  const contact = {
    id: 1,
    name: 'John Doe',
    phone: '1234567890',
    photo: null,
    isFavorite: true,
    isEmergency: false,
  };

  it('renders correctly', () => {
    const { getByText } = render(
      <SettingsProvider>
        <ContactCard contact={contact} onCall={() => {}} onMessage={() => {}} />
      </SettingsProvider>
    );
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('calls onCall when call button is pressed', () => {
    const onCall = jest.fn();
    const { getByLabelText } = render(
      <SettingsProvider>
        <ContactCard contact={contact} onCall={onCall} onMessage={() => {}} />
      </SettingsProvider>
    );
    fireEvent.press(getByLabelText('Call John Doe'));
    expect(onCall).toHaveBeenCalled();
  });

  it('calls onMessage when message button is pressed', () => {
    const onMessage = jest.fn();
    const { getByLabelText } = render(
      <SettingsProvider>
        <ContactCard contact={contact} onCall={() => {}} onMessage={onMessage} />
      </SettingsProvider>
    );
    fireEvent.press(getByLabelText('Message John Doe'));
    expect(onMessage).toHaveBeenCalled();
  });
});
