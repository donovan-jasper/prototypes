import OpenAI from 'openai';
import { getProviderConfigByName } from '../db.js';
import { Readable } from 'stream';

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

export const transcribeAudio = async (audioBuffer, format = 'webm', language = 'en') => {
    try {
        const openai = await initializeOpenAI();

        const audioFile = {
            name: `audio.${format}`,
            type: `audio/${format}`,
            [Symbol.toStringTag]: 'File',
            stream() {
                return Readable.from(audioBuffer);
            },
            arrayBuffer() {
                return Promise.resolve(audioBuffer.buffer || audioBuffer);
            }
        };

        const transcription = await openai.audio.transcriptions.create({
            file: audioFile,
            model: 'whisper-1',
            language: language,
        });

        return transcription.text;
    } catch (error) {
        console.error('Error transcribing audio with OpenAI Whisper:', error);
        throw new Error(`STT failed: ${error.message}`);
    }
};
