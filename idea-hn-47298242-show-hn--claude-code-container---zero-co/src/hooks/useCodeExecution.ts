import { useState } from 'react';

export const useCodeExecution = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const executeCode = async (code: string) => {
    setIsExecuting(true);
    setExecutionError(null);

    try {
      // In a real implementation, this would call your backend API
      // For now, we'll simulate execution
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate different outputs based on code
      if (code.includes('throw')) {
        throw new Error('Simulated error: Code threw an exception');
      }

      return {
        output: `Simulated output for:\n${code}`,
        language: 'javascript',
        timestamp: new Date()
      };
    } catch (error) {
      setExecutionError(error instanceof Error ? error.message : 'Unknown error occurred');
      throw error;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    executeCode,
    isExecuting,
    executionError
  };
};
