import * as SQLite from 'expo-sqlite';
import { WebView } from 'react-native-webview';
import { v4 as uuidv4 } from 'uuid';

const db = SQLite.openDatabase('typebridge.db');

interface CompilationResult {
  success: boolean;
  wasmBytes?: Uint8Array;
  error?: string;
  requestId: string;
}

interface CompilationRequest {
  code: string;
  requestId: string;
  resolve: (result: CompilationResult) => void;
  reject: (error: Error) => void;
}

class WebViewCompiler {
  private static instance: WebViewCompiler;
  private webViewRef: React.RefObject<WebView>;
  private queue: CompilationRequest[] = [];
  private isProcessing = false;
  private webViewReady = false;
  private compilationProgress: Record<string, number> = {};

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

              if (event.data.type === 'compile') {
                try {
                  const code = event.data.code;
                  const requestId = event.data.requestId;

                  // Notify progress
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'progress',
                    progress: 10,
                    requestId: requestId
                  }));

                  // Compile TypeScript to JavaScript
                  const jsCode = ts.transpileModule(code, {
                    compilerOptions: {
                      module: ts.ModuleKind.ES2020,
                      target: ts.ScriptTarget.ES2020,
                      strict: true
                    }
                  }).outputText;

                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'progress',
                    progress: 40,
                    requestId: requestId
                  }));

                  // Compile JavaScript to WASM using AssemblyScript
                  const result = await asc.compileString(jsCode, {
                    optimizeLevel: 3,
                    runtime: 'stub',
                    target: 'web'
                  });

                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'progress',
                    progress: 80,
                    requestId: requestId
                  }));

                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'compilationResult',
                    success: true,
                    wasmBytes: Array.from(result.buffer),
                    requestId: requestId
                  }));
                } catch (error) {
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'compilationResult',
                    success: false,
                    error: error.message || 'Unknown compilation error',
                    requestId: event.data.requestId
                  }));
                }
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

      if (data.type === 'progress') {
        this.compilationProgress[data.requestId] = data.progress;
        return;
      }

      if (data.type === 'compilationResult') {
        const requestIndex = this.queue.findIndex(req => req.requestId === data.requestId);
        if (requestIndex !== -1) {
          const request = this.queue[requestIndex];
          this.queue.splice(requestIndex, 1);

          if (data.success) {
            request.resolve({
              success: true,
              wasmBytes: new Uint8Array(data.wasmBytes),
              requestId: data.requestId
            });
          } else {
            request.resolve({
              success: false,
              error: data.error,
              requestId: data.requestId
            });
          }

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

    this.webViewRef.current?.postMessage(JSON.stringify({
      type: 'compile',
      code: request.code,
      requestId: request.requestId
    }));
  }

  public async compile(code: string): Promise<CompilationResult> {
    return new Promise((resolve, reject) => {
      const requestId = uuidv4();
      this.queue.push({
        code,
        requestId,
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  public getCompilationProgress(requestId: string): number {
    return this.compilationProgress[requestId] || 0;
  }

  public cleanup() {
    this.queue = [];
    this.isProcessing = false;
    this.webViewReady = false;
    this.compilationProgress = {};
  }
}

export const compileTypeScriptToWasm = async (code: string): Promise<CompilationResult> => {
  const compiler = WebViewCompiler.getInstance();
  return compiler.compile(code);
};

export const getCompilationProgress = (requestId: string): number => {
  const compiler = WebViewCompiler.getInstance();
  return compiler.getCompilationProgress(requestId);
};

export const cleanupCompiler = () => {
  const compiler = WebViewCompiler.getInstance();
  compiler.cleanup();
};

export const validateWasmOutput = (wasmBytes: Uint8Array): boolean => {
  // Check for WASM magic number (0x00 0x61 0x73 0x6d)
  if (wasmBytes.length < 4) return false;
  return wasmBytes[0] === 0x00 &&
         wasmBytes[1] === 0x61 &&
         wasmBytes[2] === 0x73 &&
         wasmBytes[3] === 0x6d;
};
