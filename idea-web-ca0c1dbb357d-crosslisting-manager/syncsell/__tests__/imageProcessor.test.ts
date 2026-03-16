import { compressImage, formatImageForPlatform, addWatermark } from '../lib/utils/imageProcessor';

describe('Image Processor', () => {
  it('should compress an image', async () => {
    const uri = 'test.jpg';
    const compressedUri = await compressImage(uri);
    expect(compressedUri).toBeDefined();
  });

  it('should format an image for TikTok Shop', async () => {
    const uri = 'test.jpg';
    const formattedUri = await formatImageForPlatform(uri, 'TikTok Shop');
    expect(formattedUri).toBeDefined();
  });

  it('should format an image for Instagram Shopping', async () => {
    const uri = 'test.jpg';
    const formattedUri = await formatImageForPlatform(uri, 'Instagram Shopping');
    expect(formattedUri).toBeDefined();
  });

  it('should format an image for Facebook Marketplace', async () => {
    const uri = 'test.jpg';
    const formattedUri = await formatImageForPlatform(uri, 'Facebook Marketplace');
    expect(formattedUri).toBeDefined();
  });

  it('should add a watermark for non-premium users', async () => {
    const uri = 'test.jpg';
    const watermarkedUri = await addWatermark(uri, false);
    expect(watermarkedUri).toBeDefined();
  });

  it('should not add a watermark for premium users', async () => {
    const uri = 'test.jpg';
    const watermarkedUri = await addWatermark(uri, true);
    expect(watermarkedUri).toBe(uri);
  });
});
