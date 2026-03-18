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
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

// Replace with your deployed backend URL (e.g., Railway, Render, AWS)
const API_URL = 'https://your-backend-url.com';

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [code, setCode] = useState<string>('// Write your code here\nconsole.log("Hello, CodeCapsule!");');
  const [language, setLanguage] = useState<string>('javascript');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outputs, setOutputs] = useState<Output[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

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
      } catch (error) {
        console.error('Error creating session:', error);
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
    
    try {
      const response = await fetch(`${API_URL}/api/run/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, language }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setOutputs(prev => [...prev, {
          output: errorData.error,
          language,
          timestamp: new Date(),
          id: Date.now(),
        }]);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutputs(prev => [...prev, {
        output: 'Network error occurred',
        language,
        timestamp: new Date(),
        id: Date.now(),
      }]);
      setIsRunning(false);
    }
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
