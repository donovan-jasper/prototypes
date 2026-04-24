import * as SQLite from 'expo-sqlite';
import { WebView } from 'react-native-webview';
import { validateWasmOutput } from './validation';

const db = SQLite.openDatabase('typebridge.db');

interface CompilationResult {
  success: boolean;
  wasmBytes?: Uint8Array;
  error?: string;
}

export async function compileTypeScriptToWasm(code: string): Promise<CompilationResult> {
  // First check cache
  const cached = await checkCache(code);
  if (cached) return cached;

  // If not cached, compile fresh
  return new Promise((resolve) => {
    const webViewRef = React.createRef<WebView>();

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);

        if (data.type === 'compilationResult') {
          if (data.success) {
            const wasmBytes = new Uint8Array(data.wasmBytes);
            if (validateWasmOutput(wasmBytes)) {
              // Cache successful compilation
              cacheCompilation(code, wasmBytes);
              resolve({ success: true, wasmBytes });
            } else {
              resolve({ success: false, error: 'Invalid WASM output format' });
            }
          } else {
            resolve({ success: false, error: data.error });
          }
        }
      } catch (error) {
        resolve({ success: false, error: 'Failed to parse compilation result' });
      }
    };

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <script src="https://cdn.jsdelivr.net/npm/typescript@4.9.5/lib/typescriptServices.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/assemblyscript@0.27.2/dist/assemblyscript.js"></script>
        </head>
        <body>
          <script>
            window.addEventListener('message', async (event) => {
              try {
                const code = event.data.code;

                // Compile TypeScript to JavaScript
                const jsCode = ts.transpileModule(code, {
                  compilerOptions: {
                    module: ts.ModuleKind.ES2020,
                    target: ts.ScriptTarget.ES2020,
                    strict: true
                  }
                }).outputText;

                // Compile JavaScript to WASM using AssemblyScript
                const result = await asc.compileString(jsCode, {
                  optimizeLevel: 3,
                  runtime: 'stub',
                  target: 'web'
                });

                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'compilationResult',
                  success: true,
                  wasmBytes: Array.from(result.buffer)
                }));
              } catch (error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'compilationResult',
                  success: false,
                  error: error.message || 'Unknown compilation error'
                }));
              }
            });
          </script>
        </body>
      </html>
    `;

    // Create a temporary container for the WebView
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Render WebView and send code
    ReactDOM.render(
      <WebView
        ref={webViewRef}
        source={{ html }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        injectedJavaScript={`window.postMessage({ code: ${JSON.stringify(code)} }, '*');`}
        style={{ display: 'none' }}
      />,
      container
    );

    // Clean up after a delay to prevent memory leaks
    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
    }, 5000);
  });
}

async function checkCache(code: string): Promise<CompilationResult | null> {
  return new Promise((resolve) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT wasmBytes FROM compilations WHERE codeHash = ?',
        [hashCode(code)],
        (_, { rows }) => {
          if (rows.length > 0) {
            resolve({
              success: true,
              wasmBytes: new Uint8Array(rows.item(0).wasmBytes)
            });
          } else {
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Cache check failed:', error);
          resolve(null);
        }
      );
    });
  });
}

function cacheCompilation(code: string, wasmBytes: Uint8Array) {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT OR REPLACE INTO compilations (codeHash, code, wasmBytes) VALUES (?, ?, ?)',
      [hashCode(code), code, Array.from(wasmBytes)]
    );
  });
}

function hashCode(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

export function validateWasmOutput(wasmBytes: Uint8Array): boolean {
  // Check for WASM magic number (0x00, 0x61, 0x73, 0x6d)
  if (wasmBytes.length < 4) return false;
  return wasmBytes[0] === 0x00 &&
         wasmBytes[1] === 0x61 &&
         wasmBytes[2] === 0x73 &&
         wasmBytes[3] === 0x6d;
}
