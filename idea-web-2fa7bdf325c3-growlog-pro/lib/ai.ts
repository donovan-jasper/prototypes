import * as FileSystem from 'expo-file-system';

export async function analyzePhotoHealth(imageUri: string): Promise<{
  analysis: string;
  healthScore: number;
  issues: string[];
}> {
  try {
    // Read the image file
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [{
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this plant photo for health issues, pests, diseases, and nutrient deficiencies.
              Provide a detailed analysis, a health score between 0-100 (where 100 is perfectly healthy),
              and a list of specific issues detected. Format your response as JSON with these keys:
              { "analysis": "detailed text", "healthScore": number, "issues": ["issue1", "issue2"] }`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`
              }
            }
          ]
        }],
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse the JSON response from the AI
    const content = data.choices[0].message.content;
    const parsedResponse = JSON.parse(content);

    return {
      analysis: parsedResponse.analysis,
      healthScore: parsedResponse.healthScore,
      issues: parsedResponse.issues || []
    };
  } catch (error) {
    console.error('Error analyzing photo:', error);
    // Fallback to mock analysis if API fails
    return {
      analysis: 'Unable to analyze photo at this time. Please try again later.',
      healthScore: 50,
      issues: []
    };
  }
}
