import Anthropic from '@anthropic-ai/sdk';
import { createSlideHTML } from '../html/slideTemplate';
import { getSettings } from '../db/queries';
import { findBestTemplate } from './demoTemplates';
import { SYSTEM_PROMPT } from './promptTemplates';

interface GenerateSlidesResult {
  html: string;
  slideCount: number;
  title: string;
  isDemo?: boolean;
}

export async function generateSlides(
  prompt: string,
  themeName: string = 'minimal'
): Promise<GenerateSlidesResult> {
  if (!prompt.trim()) {
    throw new Error('Prompt cannot be empty');
  }

  const settings = await getSettings();
  const apiKey = settings.apiKey;

  if (!apiKey) {
    const template = findBestTemplate(prompt);
    const html = createSlideHTML(template.slides, themeName);

    return {
      html,
      slideCount: template.slides.length,
      title: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
      isDemo: true,
    };
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : '';

    if (!responseText) {
      throw new Error('Empty response from Claude API');
    }

    let slideContents: string[];
    let generatedTitle: string = prompt.slice(0, 50) + (prompt.length > 50 ? '...' : '');

    try {
      // Parse the response which should be in the format:
      // {
      //   title: "Generated Title",
      //   slides: ["Slide 1 content", "Slide 2 content", ...]
      // }
      const parsedResponse = JSON.parse(responseText);

      if (parsedResponse.title) {
        generatedTitle = parsedResponse.title;
      }

      if (!Array.isArray(parsedResponse.slides)) {
        throw new Error('Response does not contain slides array');
      }

      slideContents = parsedResponse.slides;

      if (slideContents.length === 0) {
        throw new Error('No slides generated');
      }

      if (!slideContents.every(slide => typeof slide === 'string')) {
        throw new Error('Invalid slide content format');
      }
    } catch (parseError) {
      console.error('Failed to parse Claude response:', responseText);
      throw new Error('Invalid response format from AI. Please try again.');
    }

    const html = createSlideHTML(slideContents, themeName);

    return {
      html,
      slideCount: slideContents.length,
      title: generatedTitle,
      isDemo: false,
    };
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        throw new Error('Invalid API key. Please check your Anthropic API key in Settings.');
      } else if (error.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.status === 500 || error.status === 529) {
        throw new Error('Anthropic API is temporarily unavailable. Please try again later.');
      } else {
        throw new Error(`API error: ${error.message}`);
      }
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('Failed to generate slides. Please try again.');
  }
}
