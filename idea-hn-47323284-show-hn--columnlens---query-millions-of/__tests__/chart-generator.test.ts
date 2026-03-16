import { generateChartConfig } from '../lib/chart-generator';

describe('Chart Generator', () => {
  it('generates bar chart config from query results', () => {
    const data = {
      columns: ['category', 'count'],
      rows: [['A', 10], ['B', 20], ['C', 15]]
    };
    const config = generateChartConfig(data, 'bar');
    expect(config.type).toBe('bar');
    expect(config.data.labels).toEqual(['A', 'B', 'C']);
    expect(config.data.datasets[0].data).toEqual([10, 20, 15]);
  });
});
