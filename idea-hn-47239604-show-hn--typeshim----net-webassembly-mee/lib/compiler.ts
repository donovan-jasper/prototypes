import * as SQLite from 'expo-sqlite';
import { WebView } from 'react-native-webview';
import { validateWasmOutput } from './validation';

const db = SQLite.openDatabase('typebridge.db');

interface CompilationResult {
  success: boolean;
  wasmBytes?: Uint8Array;
  error?: string;
}

interface CompilationRequest {
  code: string;
  resolve: (result: CompilationResult) => void;
  reject: (error: Error) => void;
}

class WebViewCompiler {
  private static instance: WebViewCompiler;
  private webViewRef: React.RefObject<WebView>;
  private queue: CompilationRequest[] = [];
  private isProcessing = false;
  private webViewReady = false;

  private constructor() {
    this.webViewRef = React.createRef();
    this.initializeWebView();
  }

  public static getInstance(): WebViewCompiler {
    if (!WebViewCompiler.instance) {
      WebViewCompiler.instance = new WebViewCompiler();
    }
    return WebViewCompiler.instance;
  }

  private initializeWebView() {
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
              if (event.data.type === 'ready') {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'ready'
                }));
                return;
              }

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
                  wasmBytes: Array.from(result.buffer),
                  requestId: event.data.requestId
                }));
              } catch (error) {
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'compilationResult',
                  success: false,
                  error: error.message || 'Unknown compilation error',
                  requestId: event.data.requestId
                }));
              }
            });

            // Notify when ready
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'ready'
            }));
          </script>
        </body>
      </html>
    `;

    // Create a hidden WebView instance
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);

    ReactDOM.render(
      <WebView
        ref={this.webViewRef}
        source={{ html }}
        onMessage={this.handleWebViewMessage.bind(this)}
        javaScriptEnabled={true}
        originWhitelist={['*']}
        style={{ display: 'none' }}
      />,
      container
    );
  }

  private handleWebViewMessage(event: any) {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === 'ready') {
        this.webViewReady = true;
        this.processQueue();
        return;
      }

      if (data.type === 'compilationResult') {
        const request = this.queue.find(req => req.requestId === data.requestId);
        if (request) {
          if (data.success) {
            const wasmBytes = new Uint8Array(data.wasmBytes);
            if (validateWasmOutput(wasmBytes)) {
              request.resolve({ success: true, wasmBytes });
            } else {
              request.resolve({ success: false, error: 'Invalid WASM output format' });
            }
          } else {
            request.resolve({ success: false, error: data.error });
          }
          this.queue = this.queue.filter(req => req.requestId !== data.requestId);
          this.isProcessing = false;
          this.processQueue();
        }
      }
    } catch (error) {
      console.error('Error processing WebView message:', error);
    }
  }

  private processQueue() {
    if (!this.webViewReady || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const request = this.queue[0];

    try {
      this.webViewRef.current?.postMessage(JSON.stringify({
        type: 'compile',
        code: request.code,
        requestId: request.requestId
      }));
    } catch (error) {
      request.reject(error);
      this.queue.shift();
      this.isProcessing = false;
      this.processQueue();
    }
  }

  public async compile(code: string): Promise<CompilationResult> {
    // Check cache first
    const cached = await this.checkCache(code);
    if (cached) return cached;

    return new Promise((resolve, reject) => {
      const requestId = Date.now().toString();
      this.queue.push({ code, resolve, reject, requestId });
      this.processQueue();
    });
  }

  private async checkCache(code: string): Promise<CompilationResult | null> {
    return new Promise((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT wasmBytes FROM compilations WHERE codeHash = ?',
          [this.hashCode(code)],
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

  private hashCode(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  public cleanup() {
    // Clean up the WebView instance
    if (this.webViewRef.current) {
      ReactDOM.unmountComponentAtNode(this.webViewRef.current);
    }
    WebViewCompiler.instance = null;
  }
}

export const compileTypeScriptToWasm = (code: string) => WebViewCompiler.getInstance().compile(code);
export const cleanupCompiler = () => WebViewCompiler.getInstance().cleanup();
