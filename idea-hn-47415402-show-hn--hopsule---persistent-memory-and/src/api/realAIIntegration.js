import { validateRule } from '../hooks/useAIRuleInjection';

const API_BASE_URL = 'https://api.cursor.so/v1'; // Replace with actual API endpoint
const API_KEY = process.env.CURSOR_API_KEY || 'your-api-key-here'; // Should be stored securely

export const injectRulesIntoAISuggestion = (codeSuggestion, rules) => {
  if (!codeSuggestion || !rules || rules.length === 0) {
    return codeSuggestion;
  }

  let modifiedSuggestion = codeSuggestion;

  rules.forEach(rule => {
    try {
      const regex = new RegExp(rule.pattern, 'g');
      const matches = modifiedSuggestion.match(regex);

      if (matches) {
        modifiedSuggestion = modifiedSuggestion.replace(
          regex,
          match => `/* RULE VIOLATION: ${rule.name} */ ${match}`
        );
      }
    } catch (error) {
      console.error(`Error processing rule ${rule.name}:`, error);
    }
  });

  return modifiedSuggestion;
};

export const getAISuggestions = async (prompt) => {
  if (!prompt) {
    throw new Error('Prompt is required');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ prompt }),
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    throw new Error(`Failed to get AI suggestions: ${error.message}`);
  }
};

export const analyzeCodeWithAI = async (code) => {
  if (!code) {
    throw new Error('Code is required for analysis');
  }

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({ code }),
      timeout: 15000 // 15 second timeout for analysis
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing code with AI:', error);
    throw new Error(`Failed to analyze code: ${error.message}`);
  }
};
