import React from 'react';
import { WebView } from 'react-native-webview';

const WasmPreview = ({ wasmBytes, onConsoleMessage }) => {
  return (
    <WebView
      source={{ html: `
        <!DOCTYPE html>
        <html>
          <head>
            <script>
              // WASM execution code
              // Capture console.log and send to React Native
            </script>
          </head>
          <body>
            <script>
              // Load and execute WASM
            </script>
          </body>
        </html>
      ` }}
      onMessage={(event) => {
        const message = JSON.parse(event.nativeEvent.data);
        if (message.type === 'console') {
          onConsoleMessage(message.message);
        }
      }}
    />
  );
};

export default WasmPreview;
