const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export async function refinePost(text: string, tone: string = 'friendly'): Promise<string> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return text;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a social media expert. Improve posts to be engaging and concise. Keep the user's voice but make it more compelling. Add 2-3 relevant hashtags at the end. Keep under 500 characters. Tone: ${tone}.`,
          },
          {
            role: 'user',
            content: `Improve this social media post: ${text}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const refinedText = data.choices[0]?.message?.content?.trim();
    
    if (!refinedText) {
      throw new Error('No response from OpenAI');
    }

    return refinedText.length > 500 ? refinedText.substring(0, 497) + '...' : refinedText;
  } catch (error) {
    console.error('Error refining post:', error);
    throw error;
  }
}

export async function suggestHashtags(text: string): Promise<string[]> {
  if (!OPENAI_API_KEY) {
    return [];
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a hashtag expert. Suggest 3-5 relevant hashtags for social media posts. Return only hashtags, one per line, with # prefix.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        max_tokens: 50,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const hashtags = data.choices[0]?.message?.content
      ?.trim()
      .split('\n')
      .filter((tag: string) => tag.startsWith('#'))
      .slice(0, 5);
    
    return hashtags || [];
  } catch (error) {
    console.error('Error suggesting hashtags:', error);
    return [];
  }
}
