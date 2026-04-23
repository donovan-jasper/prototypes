import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SMSScreen from '../screens/SMSScreen';
import { auth, db } from '../../App';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Mock Firebase
jest.mock('../../App', () => ({
  auth: {
    currentUser: {
      uid: 'test-user-id'
    }
  },
  db: {
    collection: jest.fn(),
    addDoc: jest.fn(),
    serverTimestamp: jest.fn()
  }
}));

// Mock SMS listener
jest.mock('../utils/smsListener', () => ({
  startSMSListener: jest.fn(() => jest.fn())
}));

// Mock encryption
jest.mock('../utils/encryption', () => ({
  encryptData: jest.fn((data) => Promise.resolve(`encrypted:${data}`))
}));

describe('SMSScreen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<SMSScreen />);
    expect(getByText('Forwarded SMS Messages')).toBeTruthy();
  });

  it('shows empty state when no messages', () => {
    const { getByText } = render(<SMSScreen />);
    expect(getByText('No forwarded SMS messages yet')).toBeTruthy();
  });

  it('toggles forwarding setting', () => {
    const { getByText } = render(<SMSScreen />);
    const switchElement = getByText('Enable SMS Forwarding').parent.parent;
    fireEvent.press(switchElement);
    // Add assertion for the toggle action
  });

  it('allows replying to messages', () => {
    const { getByText, getByPlaceholderText } = render(<SMSScreen />);
    // Mock selected message
    const mockMessage = { id: '1', sender: 'Test', content: 'Hello' };
    fireEvent.press(getByText('Reply to Test'));
    const input = getByPlaceholderText('Type your reply...');
    fireEvent.changeText(input, 'Test reply');
    fireEvent.press(getByText('Send Reply'));
    // Add assertion for reply action
  });
});
