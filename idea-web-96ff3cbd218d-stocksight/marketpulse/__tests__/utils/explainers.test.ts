import { generateSummary, generateExplainer } from '../../utils/explainers';

describe('Explainers', () => {
  it('should generate a summary', () => {
    const summary = generateSummary({});
    expect(summary).toBeDefined();
  });

  it('should generate an explainer', () => {
    const explainer = generateExplainer('topic');
    expect(explainer).toBeDefined();
  });
});
