export const parseQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  let filter = {};

  if (lowerQuery.includes('error')) {
    filter.severity = 'error';
  } else if (lowerQuery.includes('warning')) {
    filter.severity = 'warning';
  } else if (lowerQuery.includes('info')) {
    filter.severity = 'info';
  }

  const statusCodeMatch = lowerQuery.match(/\d{3}/);
  if (statusCodeMatch) {
    filter.statusCode = parseInt(statusCodeMatch[0]);
  }

  return filter;
};
