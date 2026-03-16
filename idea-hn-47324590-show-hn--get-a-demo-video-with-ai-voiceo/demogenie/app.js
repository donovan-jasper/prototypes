const express = require('express');
const path = require('path');
const { Command } = require('commander');
const PlaywrightService = require('./services/PlaywrightService');
const NLGService = require('./services/NLGService');
const VoiceSynthesisService = require('./services/VoiceSynthesisService');
const videoUtils = require('./utils/videoUtils');

const app = express();
const program = new Command();

app.use(express.static(path.join(__dirname, 'public')));

program
  .version('1.0.0')
  .description('DemoGenie CLI tool for generating demo videos with AI voiceover');

program
  .command('generate <url>')
  .description('Generate a demo video for the given URL')
  .action(async (url) => {
    try {
      const playwrightService = new PlaywrightService();
      const nlgService = new NLGService();
      const voiceSynthesisService = new VoiceSynthesisService();

      // Navigate to the URL and generate screenshots
      const screenshots = await playwrightService.navigateAndCapture(url);

      // Generate voiceover script
      const script = await nlgService.generateScript(screenshots);

      // Synthesize voiceover
      const voiceover = await voiceSynthesisService.synthesize(script);

      // Create video from screenshots and voiceover
      const videoPath = await videoUtils.createVideo(screenshots, voiceover);

      console.log(`Demo video generated at: ${videoPath}`);
    } catch (error) {
      console.error('Error generating demo video:', error);
    }
  });

program.parse(process.argv);
