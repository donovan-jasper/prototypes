import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PlatformSelector from '../../components/PlatformSelector';

describe('PlatformSelector', () => {
  const platforms = ['TikTok Shop', 'Instagram Shopping', 'Facebook Marketplace'];

  it('should render platform options', () => {
    const { getByText } = render(
      <PlatformSelector selectedPlatforms={[]} onSelectPlatforms={() => {}} />
    );

    platforms.forEach((platform) => {
      expect(getByText(platform)).toBeDefined();
    });
  });

  it('should select a platform', () => {
    const mockOnSelectPlatforms = jest.fn();
    const { getByText } = render(
      <PlatformSelector selectedPlatforms={[]} onSelectPlatforms={mockOnSelectPlatforms} />
    );

    fireEvent.press(getByText('TikTok Shop'));
    expect(mockOnSelectPlatforms).toHaveBeenCalledWith(['TikTok Shop']);
  });

  it('should deselect a platform', () => {
    const mockOnSelectPlatforms = jest.fn();
    const { getByText } = render(
      <PlatformSelector selectedPlatforms={['TikTok Shop']} onSelectPlatforms={mockOnSelectPlatforms} />
    );

    fireEvent.press(getByText('TikTok Shop'));
    expect(mockOnSelectPlatforms).toHaveBeenCalledWith([]);
  });

  it('should show upgrade modal for free tier', () => {
    const mockOnSelectPlatforms = jest.fn();
    const { getByText } = render(
      <PlatformSelector
        selectedPlatforms={['TikTok Shop', 'Instagram Shopping']}
        onSelectPlatforms={mockOnSelectPlatforms}
      />
    );

    fireEvent.press(getByText('Facebook Marketplace'));
    expect(mockOnSelectPlatforms).not.toHaveBeenCalled();
    expect(getByText('Upgrade to Premium to connect more platforms')).toBeDefined();
  });
});
