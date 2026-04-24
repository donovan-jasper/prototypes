import { X86Compiler } from './targets/x86';
import { ARMCompiler } from './targets/arm';
import { AVRCompiler } from './targets/avr';
import { Z80Compiler } from './targets/z80';
import { MOS6502Compiler } from './targets/mos6502';

export interface CompilationResult {
  success: boolean;
  binary?: Uint8Array;
  hexDump?: string;
  assembly?: string;
  logs: string[];
  errors: CompilationError[];
}

export interface CompilationError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}

export enum CompilationTarget {
  X86 = 'x86',
  ARM = 'arm',
  AVR = 'avr',
  Z80 = 'z80',
  MOS6502 = 'mos6502',
}

export class CompilerEngine {
  private compilers: Map<CompilationTarget, any> = new Map();
  private wasmModules: Map<string, WebAssembly.Module> = new Map();

  constructor() {
    this.compilers.set(CompilationTarget.X86, new X86Compiler());
    this.compilers.set(CompilationTarget.ARM, new ARMCompiler());
    this.compilers.set(CompilationTarget.AVR, new AVRCompiler());
    this.compilers.set(CompilationTarget.Z80, new Z80Compiler());
    this.compilers.set(CompilationTarget.MOS6502, new MOS6502Compiler());
  }

  async loadWasmModule(target: string): Promise<WebAssembly.Module> {
    if (this.wasmModules.has(target)) {
      return this.wasmModules.get(target)!;
    }

    try {
      const response = await fetch(`lib/compiler/wasm/${target}.wasm`);
      const buffer = await response.arrayBuffer();
      const module = await WebAssembly.compile(buffer);
      this.wasmModules.set(target, module);
      return module;
    } catch (error) {
      console.error(`Failed to load WASM module for ${target}:`, error);
      throw error;
    }
  }

  async compile(code: string, target: CompilationTarget): Promise<CompilationResult> {
    const logs: string[] = [];
    const errors: CompilationError[] = [];

    logs.push(`[INFO] Starting compilation for target: ${target}`);

    try {
      const compiler = this.compilers.get(target);
      if (!compiler) {
        throw new Error(`Unsupported compilation target: ${target}`);
      }

      // Initialize the compiler if needed
      if (compiler.initialize && typeof compiler.initialize === 'function') {
        await compiler.initialize();
      }

      // Perform the compilation
      const result = await compiler.compile(code);

      // Merge logs and errors
      logs.push(...result.logs);
      errors.push(...result.errors);

      return {
        ...result,
        logs,
        errors
      };
    } catch (error) {
      console.error('Compilation error:', error);
      errors.push({
        line: 0,
        column: 0,
        message: error instanceof Error ? error.message : 'Unknown compilation error',
        severity: 'error'
      });

      return {
        success: false,
        logs,
        errors
      };
    }
  }
}
