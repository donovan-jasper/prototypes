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
