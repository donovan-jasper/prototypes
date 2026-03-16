export const queryTemplates = [
  {
    id: '1',
    name: 'Top 10 by value',
    description: 'Get the top 10 rows sorted by a column',
    sql: 'SELECT * FROM {TABLE} ORDER BY {COLUMN} DESC LIMIT 10'
  },
  {
    id: '2',
    name: 'Group by month',
    description: 'Group data by month',
    sql: 'SELECT strftime("%Y-%m", {DATE_COLUMN}) as month, COUNT(*) as count FROM {TABLE} GROUP BY month'
  },
  {
    id: '3',
    name: 'Find duplicates',
    description: 'Find duplicate values in a column',
    sql: 'SELECT {COLUMN}, COUNT(*) as count FROM {TABLE} GROUP BY {COLUMN} HAVING count > 1'
  },
  {
    id: '4',
    name: 'Summary statistics',
    description: 'Get min, max, avg for a column',
    sql: 'SELECT MIN({COLUMN}) as min, MAX({COLUMN}) as max, AVG({COLUMN}) as avg FROM {TABLE}'
  }
];
