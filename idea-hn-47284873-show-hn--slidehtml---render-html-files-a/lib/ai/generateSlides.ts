import Anthropic from '@anthropic-ai/sdk';
import { createSlideHTML } from '../html/slideTemplate';
import { getSettings } from '../db/queries';
import { findBestTemplate } from './demoTemplates';

interface GenerateSlidesResult {
  html: string;
  slideCount: number;
  isDemo?: boolean;
}

const SYSTEM_PROMPT = `You are an expert presentation designer. Generate slide content as an array of HTML strings based on the user's prompt.

Rules:
1. Return ONLY a valid JSON array of HTML strings, nothing else
2. Each array element is the content for ONE slide
3. Use semantic HTML: <h1> for titles, <h2> for subtitles, <h3> for section headers, <p> for body text, <ul>/<li> for lists
4. Keep content concise - slides should be scannable, not text-heavy
5. Use <strong> for emphasis and key terms
6. Aim for 3-7 slides depending on topic complexity
7. First slide should be a title slide with main topic
8. Last slide should be a conclusion or call-to-action
9. Middle slides should cover key points with clear hierarchy

Example output format:
[
  "<h1>Main Title</h1><p>Subtitle or tagline</p>",
  "<h2>Key Point 1</h2><ul><li>Supporting detail</li><li>Another detail</li></ul>",
  "<h2>Conclusion</h2><p>Final thoughts</p>"
]

Do NOT include any markdown, explanations, or text outside the JSON array.`;

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
    try {
      slideContents = JSON.parse(responseText);
      
      if (!Array.isArray(slideContents)) {
        throw new Error('Response is not an array');
      }

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
