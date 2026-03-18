import React from 'react';
import { render, waitFor } from '@testing-library/react-native';
import VideoPlayer from './VideoPlayer';

describe('VideoPlayer', () => {
  it('renders loading indicator initially', () => {
    const { getByTestId } = render(<VideoPlayer streamUrl="https://example.com/stream.m3u8" />);
    expect(getByTestId('loading-indicator')).toBeTruthy();
  });

  it('displays error message when stream fails to load', async () => {
    const { getByText } = render(<VideoPlayer streamUrl="https://example.com/invalid-stream.m3u8" />);
    await waitFor(() => {
      expect(getByText('Failed to load stream. Please try again later.')).toBeTruthy();
    });
  });

  it('renders video player with correct testID', () => {
    const { getByTestId } = render(<VideoPlayer streamUrl="https://example.com/stream.m3u8" />);
    expect(getByTestId('video-player')).toBeTruthy();
  });
});
