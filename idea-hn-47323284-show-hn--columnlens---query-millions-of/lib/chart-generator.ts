export const generateChartConfig = (data: { columns: string[], rows: any[] }, type: 'bar' | 'line' | 'pie') => {
  if (data.rows.length === 0) {
    return { type, data: { labels: [], datasets: [{ data: [] }] } };
  }
  
  const labels = data.rows.map(row => String(row[data.columns[0]]));
  const values = data.rows.map(row => Number(row[data.columns[1]]) || 0);
  
  return {
    type,
    data: {
      labels,
      datasets: [{ data: values }]
    }
  };
};
