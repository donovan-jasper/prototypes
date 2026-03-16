export const parseVoiceCommand = (text: string) => {
  const createRegex = /create\s+(\w+)\s+database\s+with\s+(.+)/i;
  const createMatch = text.match(createRegex);
  if (createMatch) {
    const tableName = createMatch[1];
    const fields = createMatch[2].split(/\s+and\s+|\s*,\s*/).map(field => ({
      name: field.trim(),
      type: 'TEXT'
    }));
    return { action: 'create', tableName, fields };
  }

  const queryRegex = /show\s+(\w+)\s+who\s+(.+)/i;
  const queryMatch = text.match(queryRegex);
  if (queryMatch) {
    const tableName = queryMatch[1];
    const conditions = queryMatch[2];
    return { action: 'query', tableName, conditions };
  }

  return { action: 'unknown', tableName: '', fields: [], conditions: '' };
};

export const generateSQL = (naturalLanguage: string, schema: string) => {
  const parsed = parseVoiceCommand(naturalLanguage);
  if (parsed.action === 'query') {
    const { tableName, conditions } = parsed;
    return `SELECT * FROM ${tableName} WHERE ${conditions}`;
  }
  return 'SELECT * FROM ' + schema;
};
