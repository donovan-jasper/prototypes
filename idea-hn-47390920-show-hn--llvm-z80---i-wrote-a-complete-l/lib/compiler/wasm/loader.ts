export class WasmModuleLoader {
  private static instance: WasmModuleLoader;
  private moduleCache: Map<string, WebAssembly.Module> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): WasmModuleLoader {
    if (!WasmModuleLoader.instance) {
      WasmModuleLoader.instance = new WasmModuleLoader();
    }
    return WasmModuleLoader.instance;
  }

  async loadModule(target: string): Promise<WebAssembly.Module> {
    // Check cache first
    if (this.moduleCache.has(target)) {
      return this.moduleCache.get(target)!;
    }

    try {
      // In development, use mock WASM modules
      if (__DEV__) {
        const mockModule = await this.createMockModule(target);
        this.moduleCache.set(target, mockModule);
        return mockModule;
      }

      // In production, load real WASM modules
      const response = await fetch(`./wasm/${target}.wasm`);
      if (!response.ok) {
        throw new Error(`Failed to load WASM module for ${target}`);
      }

      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.compile(buffer);
      this.moduleCache.set(target, module);
      return module;
    } catch (error) {
      console.error(`Error loading WASM module for ${target}:`, error);
      throw error;
    }
  }

  async instantiateModule(target: string, imports?: WebAssembly.Imports): Promise<WebAssembly.Instance> {
    const module = await this.loadModule(target);
    return await WebAssembly.instantiate(module, imports);
  }

  clearCache(): void {
    this.moduleCache.clear();
  }

  private async createMockModule(target: string): Promise<WebAssembly.Module> {
    // Create a simple mock WASM module for development
    const mockWasm = `
      (module
        (memory (export "memory") 1)
        (func (export "compile_x86") (param $code_ptr i32) (result i32)
          (i32.const 0)  ; Return success
        )
        (func (export "get_binary_size") (result i32)
          (i32.const 16)  ; Mock binary size
        )
        (func (export "get_binary_ptr") (result i32)
          (i32.const 0)  ; Mock binary pointer
        )
        (func (export "get_error_count") (result i32)
          (i32.const 0)  ; No errors
        )
        (func (export "allocate") (param $size i32) (result i32)
          (i32.const 0)  ; Mock allocation
        )
      )
    `;

    const buffer = new TextEncoder().encode(mockWasm);
    return await WebAssembly.compile(buffer);
  }
}
