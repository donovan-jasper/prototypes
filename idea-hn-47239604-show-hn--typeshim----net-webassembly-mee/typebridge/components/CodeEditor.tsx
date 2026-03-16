import React from 'react';
import { WebView } from 'react-native-webview';

const CodeEditor = ({ code, onChange }) => {
  return (
    <WebView
      source={{ uri: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.30.1/min/vs/loader.js' }}
      onMessage={(event) => {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === 'codeChange') {
          onChange(message.code);
        }
      }}
      injectedJavaScript={`
        // Monaco Editor initialization code
        // Send code changes to React Native
      `}
    />
  );
};

export default CodeEditor;
