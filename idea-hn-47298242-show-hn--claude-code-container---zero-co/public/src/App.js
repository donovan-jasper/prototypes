import React, { useState, useEffect, useRef } from 'react';
import Editor from './Editor';
import OutputPanel from './OutputPanel';
import './App.css';

const App = () => {
  const [sessionId, setSessionId] = useState(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isRunning, setIsRunning] = useState(false);
  const [outputs, setOutputs] = useState([]);
  const [socket, setSocket] = useState(null);
  const [sessionCreated, setSessionCreated] = useState(false);

  const editorRef = useRef(null);

  // Initialize session and socket connection
  useEffect(() => {
    // Create a new session
    fetch('/api/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ language })
    })
    .then(response => response.json())
    .then(data => {
      setSessionId(data.sessionId);
      setSessionCreated(true);
      
      // Initialize socket connection
      const socketIo = window.io();
      setSocket(socketIo);
      
      // Join session room
      socketIo.emit('join-session', data.sessionId);
      
      // Listen for output events
      socketIo.on('output', (data) => {
        setOutputs(prev => [...prev, {
          ...data,
          id: Date.now()
        }]);
        setIsRunning(false);
      });
      
      return () => {
        socketIo.close();
      };
    })
    .catch(error => {
      console.error('Error creating session:', error);
    });
  }, []);

  const handleRunCode = async () => {
    if (!sessionId || !code.trim()) return;
    
    setIsRunning(true);
    
    try {
      const response = await fetch(`/api/run/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, language })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        setOutputs(prev => [...prev, {
          output: errorData.error,
          language,
          timestamp: new Date(),
          id: Date.now()
        }]);
        setIsRunning(false);
      }
    } catch (error) {
      console.error('Error running code:', error);
      setOutputs(prev => [...prev, {
        output: 'Network error occurred',
        language,
        timestamp: new Date(),
        id: Date.now()
      }]);
      setIsRunning(false);
    }
  };

  const handleEditorChange = (newCode) => {
    setCode(newCode);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="logo">
          <div className="logo-icon">C</div>
          <div className="logo-text">CodeCapsule</div>
        </div>
        {sessionCreated && (
          <div className="session-info">
            Session: {sessionId?.substring(0, 8)}...
          </div>
        )}
      </header>
      
      <div className="main-content">
        <div className="editor-panel">
          <div className="editor-header">
            <select 
              className="language-selector"
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="go">Go</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
            <button 
              className="run-button"
              onClick={handleRunCode}
              disabled={isRunning || !sessionId}
            >
              {isRunning ? (
                <>
                  <span className="spinner"></span> Running...
                </>
              ) : (
                'Run Code'
              )}
            </button>
          </div>
          
          <div className="editor-container">
            <Editor 
              ref={editorRef}
              value={code}
              onChange={handleEditorChange}
              language={language}
            />
          </div>
        </div>
        
        <OutputPanel outputs={outputs} />
      </div>
    </div>
  );
};

export default App;
