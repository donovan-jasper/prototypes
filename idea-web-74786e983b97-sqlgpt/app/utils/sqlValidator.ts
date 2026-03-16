const sqlValidator = (query: string): boolean => {
  const trimmedQuery = query.trim().toLowerCase();
  
  // Check if query starts with a valid SQL command
  const validStarts = ['select', 'insert', 'update', 'delete', 'create', 'alter', 'drop'];
  const startsWithValidCommand = validStarts.some(cmd => trimmedQuery.startsWith(cmd));
  
  // Check if query ends with semicolon
  const endsWithSemicolon = query.trim().endsWith(';');
  
  // Basic FROM clause check for SELECT statements
  const hasFromClause = !trimmedQuery.startsWith('select') || trimmedQuery.includes('from');
  
  return startsWithValidCommand && endsWithSemicolon && hasFromClause;
};

export default sqlValidator;
