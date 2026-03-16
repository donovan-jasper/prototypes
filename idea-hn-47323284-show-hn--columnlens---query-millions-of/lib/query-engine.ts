import { query as dbQuery } from './database';

const queryCache = new Map<string, { result: any, timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const MAX_CACHE_SIZE = 10;

export const executeQuery = async (sql: string, params: any[] = []) => {
  const cacheKey = sql + JSON.stringify(params);
  const cached = queryCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  
  const dangerousPatterns = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM\s+\w+\s*$/i,
    /UPDATE\s+\w+\s+SET\s+.*\s*$/i
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(sql)) {
      throw new Error('Dangerous query detected');
    }
  }
  
  const startTime = Date.now();
  const result = await dbQuery(sql, params);
  const executionTime = Date.now() - startTime;
  
  const output = { ...result, executionTime };
  
  if (queryCache.size >= MAX_CACHE_SIZE) {
    const firstKey = queryCache.keys().next().value;
    queryCache.delete(firstKey);
  }
  
  queryCache.set(cacheKey, { result: output, timestamp: Date.now() });
  
  return output;
};

export const optimizeQuery = (sql: string): string => {
  return sql;
};
