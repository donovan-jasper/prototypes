export class WasmModuleLoader {
  private static instance: WasmModuleLoader;
  private moduleCache: Map<string, WebAssembly.Module> = new Map();

  private constructor() {}

  public static getInstance(): WasmModuleLoader {
    if (!WasmModuleLoader.instance) {
      WasmModuleLoader.instance = new WasmModuleLoader();
    }
    return WasmModuleLoader.instance;
  }

  async loadModule(target: string): Promise<WebAssembly.Module> {
    if (this.moduleCache.has(target)) {
      return this.moduleCache.get(target)!;
    }

    try {
      const response = await fetch(`lib/compiler/wasm/${target}-toolchain.wasm`);
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.compile(buffer);
      this.moduleCache.set(target, module);
      return module;
    } catch (error) {
      console.error(`Failed to load WASM module for ${target}:`, error);
      throw error;
    }
  }

  async instantiateModule(target: string): Promise<WebAssembly.Instance> {
    const module = await this.loadModule(target);
    return await WebAssembly.instantiate(module, {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 1, element: 'anyfunc' }),
      }
    });
  }

  clearCache(): void {
    this.moduleCache.clear();
  }
}
