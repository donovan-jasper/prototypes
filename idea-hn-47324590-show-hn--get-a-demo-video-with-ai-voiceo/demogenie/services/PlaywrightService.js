const { chromium } = require('playwright');
const config = require('../config.json');

class PlaywrightService {
  async navigateAndCapture(url) {
    const browser = await chromium.launch(config.playwright);
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(url);

    // Capture screenshots of the page
    const screenshots = [];
    const elements = await page.$$('*');

    for (const element of elements) {
      const screenshot = await element.screenshot();
      screenshots.push(screenshot);
    }

    await browser.close();

    return screenshots;
  }
}

module.exports = PlaywrightService;
