const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const config = require('../config.json');

class VoiceSynthesisService {
  async synthesize(script) {
    const client = new textToSpeech.TextToSpeechClient({
      keyFilename: config.googleTextToSpeech.apiKey,
    });

    const request = {
      input: { text: script },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };

    const [response] = await client.synthesizeSpeech(request);
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('output.mp3', response.audioContent, 'binary');

    return 'output.mp3';
  }
}

module.exports = VoiceSynthesisService;
