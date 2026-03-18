import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { Attribution } from '../types';

// These should come from environment variables in production
const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey || '';
const ANTHROPIC_API_KEY = Constants.expoConfig?.extra?.anthropicApiKey || '';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

export interface GenerationResult {
  imageUrl: string;
  attribution: Attribution;
}

export const generateImage = async (prompt: string): Promise<GenerationResult> => {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  try {
    // Call OpenAI DALL-E 3 API
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'url'
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    // Download the image to local storage
    const filename = `credigen_${Date.now()}.png`;
    const localUri = `${FileSystem.documentDirectory}${filename}`;
    
    const downloadResult = await FileSystem.downloadAsync(imageUrl, localUri);
    
    if (downloadResult.status !== 200) {
      throw new Error(`Failed to download image: ${downloadResult.status}`);
    }

    // Generate attribution metadata
    const attribution: Attribution = {
      model: 'dall-e-3',
      prompt: prompt,
      timestamp: new Date().toISOString(),
      attributionId: `attribution-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };

    return {
      imageUrl: downloadResult.uri,
      attribution
    };
  } catch (error: any) {
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error?.status === 401) {
      throw new Error('Invalid API key. Please check your configuration.');
    } else if (error?.status === 400) {
      throw new Error('Invalid prompt. Please try a different description.');
    } else if (error?.code === 'ENOTFOUND' || error?.message?.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    }
    
    console.error('Error generating image:', error);
    throw new Error(error?.message || 'Failed to generate image. Please try again.');
  }
};

export const generateText = async (prompt: string): Promise<string> => {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Prompt cannot be empty');
  }

  if (!ANTHROPIC_API_KEY) {
    throw new Error('Anthropic API key not configured');
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        { role: 'user', content: prompt }
      ]
    });

    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text content returned from Claude');
    }

    return textContent.text;
  } catch (error: any) {
    // Handle specific Anthropic errors
    if (error?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    } else if (error?.status === 401) {
      throw new Error('Invalid API key. Please check your configuration.');
    } else if (error?.code === 'ENOTFOUND' || error?.message?.includes('network')) {
      throw new Error('Network error. Please check your internet connection.');
    }

    console.error('Error generating text:', error);
    throw new Error(error?.message || 'Failed to generate text. Please try again.');
  }
};
