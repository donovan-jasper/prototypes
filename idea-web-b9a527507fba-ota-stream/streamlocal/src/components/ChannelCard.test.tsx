import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ChannelCard from './ChannelCard';

describe('ChannelCard', () => {
  const mockChannel = {
    id: '1',
    name: 'ABC News',
    logo: 'https://example.com/abc-logo.png',
    currentProgram: 'Breaking News',
    nextProgram: 'Weather Update',
  };

  it('renders correctly', () => {
    const { getByText, getByTestId } = render(
      <ChannelCard channel={mockChannel} isFavorite={false} onToggleFavorite={() => {}} />
    );

    expect(getByText('ABC News')).toBeTruthy();
    expect(getByText('Breaking News')).toBeTruthy();
    expect(getByText('Next: Weather Update')).toBeTruthy();
  });

  it('calls onToggleFavorite when star icon is pressed', () => {
    const onToggleFavorite = jest.fn();
    const { getByTestId } = render(
      <ChannelCard channel={mockChannel} isFavorite={false} onToggleFavorite={onToggleFavorite} />
    );

    fireEvent.press(getByTestId('star-icon'));
    expect(onToggleFavorite).toHaveBeenCalled();
  });
});
