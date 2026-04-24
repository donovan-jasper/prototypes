import { validateRule } from '../hooks/useAIRuleInjection';

const API_BASE_URL = 'https://api.cursor.so/v1'; // Example - replace with actual API endpoint

export const injectRulesIntoAISuggestion = (codeSuggestion, rules) => {
  let modifiedSuggestion = codeSuggestion;

  rules.forEach(rule => {
    const regex = new RegExp(rule.pattern, 'g');
    const matches = modifiedSuggestion.match(regex);

    if (matches) {
      modifiedSuggestion = modifiedSuggestion.replace(
        regex,
        match => `/* RULE VIOLATION: ${rule.name} */ ${match}`
      );
    }
  });

  return modifiedSuggestion;
};

export const getAISuggestions = async (prompt) => {
  try {
    const response = await fetch(`${API_BASE_URL}/suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CURSOR_API_KEY}`
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.suggestions || [];
  } catch (error) {
    console.error('Error fetching AI suggestions:', error);
    throw error;
  }
};

export const analyzeCodeWithAI = async (code) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CURSOR_API_KEY}`
      },
      body: JSON.stringify({ code })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error analyzing code with AI:', error);
    throw error;
  }
};
