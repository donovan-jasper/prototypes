import { getTemplate, listTemplates } from '../lib/templates';

describe('Database templates', () => {
  it('returns inventory template schema', () => {
    const template = getTemplate('inventory');
    expect(template.fields).toContainEqual({ name: 'product_name', type: 'TEXT' });
    expect(template.fields).toContainEqual({ name: 'quantity', type: 'INTEGER' });
  });

  it('lists all available templates', () => {
    const templates = listTemplates();
    expect(templates.length).toBeGreaterThan(0);
    expect(templates[0]).toHaveProperty('name');
  });
});
