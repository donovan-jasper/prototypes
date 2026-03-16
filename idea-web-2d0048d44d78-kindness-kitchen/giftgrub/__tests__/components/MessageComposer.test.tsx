import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import MessageComposer from '../../components/MessageComposer';

describe('MessageComposer Component', () => {
  it('should update message on text input', () => {
    const onMessageChange = jest.fn();
    const { getByPlaceholderText } = render(
      <MessageComposer onMessageChange={onMessageChange} />
    );

    const input = getByPlaceholderText('Write your message...');
    fireEvent.changeText(input, 'Thinking of you!');

    expect(onMessageChange).toHaveBeenCalledWith('Thinking of you!');
  });

  it('should show character count', () => {
    const { getByText, getByPlaceholderText } = render(
      <MessageComposer onMessageChange={() => {}} maxLength={500} />
    );

    const input = getByPlaceholderText('Write your message...');
    fireEvent.changeText(input, 'Hello');

    expect(getByText('5 / 500')).toBeTruthy();
  });
});
