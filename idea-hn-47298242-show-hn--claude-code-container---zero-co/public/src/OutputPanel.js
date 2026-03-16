import React from 'react';

const OutputPanel = ({ outputs }) => {
  return (
    <div className="output-panel">
      <div className="output-header">Output</div>
      <div className="output-content">
        {outputs.length === 0 ? (
          <p className="placeholder">Run code to see output here...</p>
        ) : (
          outputs.map(output => (
            <div key={output.id} className="output-item">
              <div className="timestamp">
                {new Date(output.timestamp).toLocaleTimeString()}
              </div>
              <pre>{output.output}</pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
