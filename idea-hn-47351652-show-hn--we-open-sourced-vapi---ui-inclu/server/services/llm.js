import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getProviderConfigByName } from '../db.js';

let openaiClient = null;
let anthropicClient = null;

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

const initializeAnthropic = async () => {
    if (!anthropicClient) {
        const config = await getProviderConfigByName('anthropic');
        if (!config || !config.api_key) {
            throw new Error('Anthropic API key not configured.');
        }
        anthropicClient = new Anthropic({ apiKey: config.api_key });
    }
    return anthropicClient;
};

export const getLLMCompletion = async (provider, messages, llmConfig = {}) => {
    try {
        let responseText = '';

        if (provider.startsWith('openai')) {
            const openai = await initializeOpenAI();
            const model = llmConfig.model || 'gpt-3.5-turbo';
            const temperature = llmConfig.temperature !== undefined ? llmConfig.temperature : 0.7;

            const stream = await openai.chat.completions.create({
                model: model,
                messages: messages,
                temperature: temperature,
                stream: true,
            });

            for await (const chunk of stream) {
                responseText += chunk.choices[0]?.delta?.content || '';
            }
        } else if (provider.startsWith('anthropic')) {
            const anthropic = await initializeAnthropic();
            const model = llmConfig.model || 'claude-3-5-sonnet-20241022';
            const temperature = llmConfig.temperature !== undefined ? llmConfig.temperature : 0.7;

            const systemMessage = messages.find(m => m.role === 'system');
            const userMessages = messages.filter(m => m.role !== 'system');

            const stream = await anthropic.messages.stream({
                model: model,
                max_tokens: 1024,
                messages: userMessages,
                system: systemMessage ? systemMessage.content : undefined,
                temperature: temperature,
            });

            for await (const chunk of stream) {
                if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
                    responseText += chunk.delta.text;
                }
            }
        } else {
            throw new Error(`Unsupported LLM provider: ${provider}`);
        }

        return responseText;
    } catch (error) {
        console.error(`Error getting LLM completion from ${provider}:`, error);
        throw new Error(`LLM failed: ${error.message}`);
    }
};
