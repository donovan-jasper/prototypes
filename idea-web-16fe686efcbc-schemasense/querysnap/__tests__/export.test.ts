import { exportToCSV, exportToPDF } from '../lib/export';

describe('Export Functionality', () => {
  it('exports query results to CSV', () => {
    const data = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' }
    ];
    const csv = exportToCSV(data);
    expect(csv).toContain('id,name');
    expect(csv).toContain('1,Alice');
  });

  it('generates PDF report', async () => {
    const data = [{ id: 1, name: 'Alice' }];
    const pdf = await exportToPDF(data, 'Test Report');
    expect(pdf).toBeDefined();
    expect(pdf.uri).toContain('.pdf');
  });
});
