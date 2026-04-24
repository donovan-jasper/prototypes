import { validateRule } from '../hooks/useAIRuleInjection';

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
  // Mock API call to Cursor/Copilot
  // In a real implementation, this would call the actual AI API
  return new Promise(resolve => {
    setTimeout(() => {
      const mockSuggestions = [
        `function calculateTotal(items) {
          let total = 0;
          items.forEach(item => {
            total += item.price;
            console.log("Calculating item:", item.name); // This would be flagged by a rule
          });
          return total;
        }`,
        `const user = {
          id: 123,
          name: "John Doe",
          email: "john@example.com"
        };
        // This would be flagged if there's a rule against hardcoded user data`
      ];
      resolve(mockSuggestions);
    }, 1000);
  });
};
