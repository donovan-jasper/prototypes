import { CompilationResult, CompilationError } from '../CompilerEngine';
import { WasmModuleLoader } from '../wasm/loader';

export class MOS6502Compiler {
  private wasmInstance: WebAssembly.Instance | null = null;

  async initialize(): Promise<void> {
    try {
      const loader = WasmModuleLoader.getInstance();
      this.wasmInstance = await loader.instantiateModule('mos6502');
    } catch (error) {
      console.error('Failed to initialize MOS6502 compiler:', error);
      throw error;
    }
  }

  async compile(code: string): Promise<CompilationResult> {
    if (!this.wasmInstance) {
      await this.initialize();
    }

    const logs: string[] = [];
    const errors: CompilationError[] = [];
    let binary: Uint8Array | undefined;
    let hexDump: string | undefined;
    let assembly: string | undefined;

    try {
      logs.push('[INFO] Compiling MOS6502 code...');

      // Get the WASM exports
      const exports = this.wasmInstance.exports as any;

      // Allocate memory for the input code
      const codePtr = exports.allocate(code.length + 1);
      const codeView = new Uint8Array(exports.memory.buffer, codePtr, code.length + 1);
      for (let i = 0; i < code.length; i++) {
        codeView[i] = code.charCodeAt(i);
      }
      codeView[code.length] = 0; // Null-terminate

      // Call the compile function
      const result = exports.compile_mos6502(codePtr);

      if (result === 0) {
        // Compilation successful
        logs.push('[INFO] Compilation successful');

        // Get the output binary size
        const binarySize = exports.get_binary_size();
        const binaryPtr = exports.get_binary_ptr();

        // Extract the binary
        binary = new Uint8Array(exports.memory.buffer, binaryPtr, binarySize);

        // Generate hex dump
        hexDump = this.generateHexDump(binary);

        // Generate assembly (if available)
        if (exports.get_assembly) {
          const asmPtr = exports.get_assembly();
          const asmLength = exports.get_assembly_length();
          const asmView = new Uint8Array(exports.memory.buffer, asmPtr, asmLength);
          assembly = new TextDecoder().decode(asmView);
        }

        return {
          success: true,
          binary,
          hexDump,
          assembly,
          logs,
          errors
        };
      } else {
        // Compilation failed
        logs.push('[ERROR] Compilation failed');

        // Get error count and messages
        const errorCount = exports.get_error_count();
        for (let i = 0; i < errorCount; i++) {
          const errorPtr = exports.get_error(i);
          const errorView = new Uint8Array(exports.memory.buffer, errorPtr, 1024);
          const errorStr = new TextDecoder().decode(errorView).split('\0')[0];

          // Parse error message (format: "line:column:message")
          const parts = errorStr.split(':');
          if (parts.length >= 3) {
            errors.push({
              line: parseInt(parts[0]),
              column: parseInt(parts[1]),
              message: parts.slice(2).join(':'),
              severity: 'error'
            });
          } else {
            errors.push({
              line: 0,
              column: 0,
              message: errorStr,
              severity: 'error'
            });
          }
        }

        return {
          success: false,
          logs,
          errors
        };
      }
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

  private generateHexDump(binary: Uint8Array): string {
    let hexDump = '';
    for (let i = 0; i < binary.length; i += 16) {
      const chunk = binary.slice(i, i + 16);
      const address = i.toString(16).padStart(4, '0'); // 6502 uses 16-bit addresses
      const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = Array.from(chunk).map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join('');

      hexDump += `${address}  ${hex.padEnd(47, ' ')}  ${ascii}\n`;
    }
    return hexDump;
  }

  // Basic syntax validation for MOS6502 assembly
  validateSyntax(code: string): CompilationError[] {
    const errors: CompilationError[] = [];
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;

      // Check for basic syntax errors
      if (!line.includes(' ') && !line.includes('\t') && !line.startsWith(';')) {
        errors.push({
          line: i + 1,
          column: 0,
          message: 'Missing instruction or operand',
          severity: 'error'
        });
      }

      // Check for comments
      if (line.startsWith(';')) continue;

      // Check for labels
      if (line.endsWith(':')) continue;

      // Check for basic instruction format
      const parts = line.split(/\s+/);
      if (parts.length < 1) {
        errors.push({
          line: i + 1,
          column: 0,
          message: 'Invalid instruction format',
          severity: 'error'
        });
      }
    }

    return errors;
  }
}
