import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import io, { Socket } from 'socket.io-client';

interface Output {
  id: number;
  output: string;
  language: string;
  timestamp: Date;
}

interface SessionContextType {
  sessionId: string | null;
  code: string;
  language: string;
  isRunning: boolean;
  outputs: Output[];
  setCode: (code: string) => void;
  setLanguage: (language: string) => void;
  runCode: () => Promise<void>;
  clearOutputs: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Replace with your deployed backend URL (e.g., Railway, Render, AWS)
const API_URL = 'http://localhost:3000';

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, CodeCapsule!");');
  const [language, setLanguage] = useState<string>('javascript');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [executionError, setExecutionError] = useState<string | null>(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const response = await fetch(`${API_URL}/api/session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ language }),
        });

        const data = await response.json();
        setSessionId(data.sessionId);

        const socketConnection = io(API_URL);
        setSocket(socketConnection);

        socketConnection.emit('join-session', data.sessionId);

        socketConnection.on('output', (outputData: any) => {
          setOutputs(prev => [...prev, {
            ...outputData,
            id: Date.now(),
            timestamp: new Date(outputData.timestamp),
          }]);
          setIsRunning(false);
        });

        socketConnection.on('error', (errorData: any) => {
          setOutputs(prev => [...prev, {
            output: errorData.error,
            language,
            timestamp: new Date(),
            id: Date.now(),
          }]);
          setIsRunning(false);
          setExecutionError(errorData.error);
        });
      } catch (error) {
        console.error('Error creating session:', error);
        setExecutionError('Failed to connect to server');
      }
    };

    initSession();

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const runCode = async () => {
    if (!sessionId || !code.trim()) return;

    setIsRunning(true);
    setExecutionError(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${API_URL}/api/run/${sessionId}`, {
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
        setExecutionError(errorData.error || 'Execution failed');
        setIsRunning(false);
        return;
      }

      // The actual output will be received via socket.io
      // We just need to handle the case where the request succeeds but no output is received
      setTimeout(() => {
        if (isRunning) {
          setIsRunning(false);
          setOutputs(prev => [...prev, {
            output: 'Execution completed (no output received)',
            language,
            timestamp: new Date(),
            id: Date.now(),
          }]);
        }
      }, 5000); // Fallback if no output is received within 5 seconds

    } catch (error) {
      console.error('Error running code:', error);
      setExecutionError(error instanceof DOMException && error.name === 'AbortError'
        ? 'Execution timed out (30 seconds)'
        : 'Network error occurred');
      setIsRunning(false);
    }
  };

  const clearOutputs = () => {
    setOutputs([]);
    setExecutionError(null);
  };

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        code,
        language,
        isRunning,
        outputs,
        setCode,
        setLanguage,
        runCode,
        clearOutputs,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
