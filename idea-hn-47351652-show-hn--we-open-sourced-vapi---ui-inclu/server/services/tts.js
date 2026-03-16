import OpenAI from 'openai';
import { getProviderConfigByName } from '../db.js';

let openaiClient = null;

const initializeOpenAI = async () => {
    if (!openaiClient) {
        const config = await getProviderConfigByName('openai');
        if (!config || !config.api_key) {
            throw new Error('OpenAI API key not configured.');
        }
        openaiClient = new OpenAI({ apiKey: config.api_key });
    }
    return openaiClient;
};

export const generateSpeech = async (text, voice = 'alloy', format = 'opus') => {
    try {
        const openai = await initializeOpenAI();

        const speechResponse = await openai.audio.speech.create({
            model: 'tts-1',
            voice: voice,
            input: text,
            response_format: format, // e.g., 'opus', 'mp3', 'pcm'
        });

        const audioBuffer = Buffer.from(await speechResponse.arrayBuffer());
        return audioBuffer;
    } catch (error) {
        console.error('Error generating speech with OpenAI TTS:', error);
        throw new Error(`TTS failed: ${error.message}`);
    }
};
