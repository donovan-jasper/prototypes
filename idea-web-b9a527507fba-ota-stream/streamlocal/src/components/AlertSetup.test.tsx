import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import AlertSetup from './AlertSetup';

describe('AlertSetup', () => {
  it('calls onSave with the correct values when Save Alert is pressed', () => {
    const onSave = jest.fn();
    const { getByText, getByLabelText } = render(<AlertSetup onSave={onSave} />);

    fireEvent.changeText(getByLabelText('Program Name'), 'Breaking News');
    fireEvent.changeText(getByLabelText('Time'), '18:00');
    fireEvent.press(getByText('Weather Alerts'));
    fireEvent.press(getByText('Breaking News Alerts'));
    fireEvent.press(getByText('Save Alert'));

    expect(onSave).toHaveBeenCalledWith({
      program: 'Breaking News',
      time: '18:00',
      weather: true,
      breakingNews: true,
    });
  });
});
