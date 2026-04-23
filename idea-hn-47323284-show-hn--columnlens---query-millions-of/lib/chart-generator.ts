export const generateChartConfig = (
  data: { columns: string[], rows: any[] },
  type: 'bar' | 'line' | 'pie',
  xAxisColumn?: string,
  yAxisColumn?: string,
  groupByColumn?: string
) => {
  if (data.rows.length === 0) {
    return {
      type,
      data: { labels: [], datasets: [{ data: [] }] },
      xAxisLabel: '',
      yAxisLabel: ''
    };
  }

  // Use provided columns or fall back to defaults
  const xColumn = xAxisColumn || data.columns[0];
  const yColumn = yAxisColumn || data.columns[1];

  // Handle grouping if specified
  if (groupByColumn) {
    const groupedData = groupDataByColumn(data.rows, groupByColumn, xColumn, yColumn);
    return createGroupedChartConfig(groupedData, type, xColumn, yColumn);
  }

  // Default case - single dataset
  const labels = data.rows.map(row => String(row[xColumn]));
  const values = data.rows.map(row => Number(row[yColumn]) || 0);

  return {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        label: yColumn
      }]
    },
    xAxisLabel: xColumn,
    yAxisLabel: yColumn
  };
};

const groupDataByColumn = (
  rows: any[],
  groupColumn: string,
  xColumn: string,
  yColumn: string
) => {
  const groups: Record<string, any[]> = {};

  rows.forEach(row => {
    const groupValue = String(row[groupColumn]);
    if (!groups[groupValue]) {
      groups[groupValue] = [];
    }
    groups[groupValue].push(row);
  });

  return groups;
};

const createGroupedChartConfig = (
  groupedData: Record<string, any[]>,
  type: string,
  xColumn: string,
  yColumn: string
) => {
  const groupNames = Object.keys(groupedData);
  const allXValues = new Set<string>();

  // Collect all unique x-axis values across all groups
  groupNames.forEach(group => {
    groupedData[group].forEach(row => {
      allXValues.add(String(row[xColumn]));
    });
  });

  const sortedXValues = Array.from(allXValues).sort();

  // Create datasets for each group
  const datasets = groupNames.map(group => {
    const dataPoints: number[] = [];

    sortedXValues.forEach(xValue => {
      const matchingRow = groupedData[group].find(row => String(row[xColumn]) === xValue);
      dataPoints.push(matchingRow ? Number(matchingRow[yColumn]) || 0 : 0);
    });

    return {
      data: dataPoints,
      label: group
    };
  });

  return {
    type,
    data: {
      labels: sortedXValues,
      datasets
    },
    xAxisLabel: xColumn,
    yAxisLabel: yColumn
  };
};
