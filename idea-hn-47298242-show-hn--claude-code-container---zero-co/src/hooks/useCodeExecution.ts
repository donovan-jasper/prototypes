import { useState, useCallback } from 'react';
import { useSession } from '../context/SessionContext';

interface ExecutionResult {
  output: string;
  error?: string;
  timestamp: Date;
}

export const useCodeExecution = () => {
  const { sessionId, language } = useSession();
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const executeCode = useCallback(async (code: string): Promise<ExecutionResult | null> => {
    if (!sessionId) {
      setExecutionError('No active session');
      return null;
    }

    setIsExecuting(true);
    setExecutionError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(`http://localhost:3000/api/run/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error || 'Execution failed';
        setExecutionError(errorMessage);
        return {
          output: '',
          error: errorMessage,
          timestamp: new Date()
        };
      }

      const result = await response.json();
      return {
        output: result.output || '',
        timestamp: new Date(result.timestamp || Date.now())
      };

    } catch (error) {
      let errorMessage = 'Execution failed';

      if (error instanceof DOMException && error.name === 'AbortError') {
        errorMessage = 'Execution timed out (30 seconds)';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setExecutionError(errorMessage);
      return {
        output: '',
        error: errorMessage,
        timestamp: new Date()
      };
    } finally {
      setIsExecuting(false);
    }
  }, [sessionId, language]);

  return {
    executeCode,
    isExecuting,
    executionError,
    resetError: () => setExecutionError(null)
  };
};
