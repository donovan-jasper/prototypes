import { CompilationTarget } from '../CompilerEngine';

export class WasmModuleLoader {
  private static instance: WasmModuleLoader;
  private modules: Map<CompilationTarget, WebAssembly.Module> = new Map();
  private instances: Map<CompilationTarget, WebAssembly.Instance> = new Map();

  private constructor() {}

  public static getInstance(): WasmModuleLoader {
    if (!WasmModuleLoader.instance) {
      WasmModuleLoader.instance = new WasmModuleLoader();
    }
    return WasmModuleLoader.instance;
  }

  async loadModule(target: CompilationTarget): Promise<WebAssembly.Module> {
    if (this.modules.has(target)) {
      return this.modules.get(target)!;
    }

    try {
      const response = await fetch(`lib/compiler/wasm/${target}.wasm`);
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.compile(buffer);
      this.modules.set(target, module);
      return module;
    } catch (error) {
      console.error(`Failed to load WASM module for ${target}:`, error);
      throw error;
    }
  }

  async instantiateModule(target: CompilationTarget, imports?: WebAssembly.Imports): Promise<WebAssembly.Instance> {
    if (this.instances.has(target)) {
      return this.instances.get(target)!;
    }

    const module = await this.loadModule(target);
    const instance = await WebAssembly.instantiate(module, imports || {
      env: {
        memory: new WebAssembly.Memory({ initial: 256 }),
        table: new WebAssembly.Table({ initial: 1, element: 'anyfunc' }),
        abort: () => {
          throw new Error('WASM module aborted');
        }
      }
    });

    this.instances.set(target, instance);
    return instance;
  }

  getInstance(target: CompilationTarget): WebAssembly.Instance | undefined {
    return this.instances.get(target);
  }

  clearCache(): void {
    this.modules.clear();
    this.instances.clear();
  }
}
