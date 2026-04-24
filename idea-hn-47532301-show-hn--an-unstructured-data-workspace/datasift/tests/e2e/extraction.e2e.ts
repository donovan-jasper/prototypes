describe('Extraction', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should extract data from text', async () => {
    await element(by.id('textInput')).typeText('Contact John at john@example.com by Friday.');
    await element(by.text('Submit Text')).tap();
    await expect(element(by.text('Extracted Data'))).toBeVisible();
  });
});
