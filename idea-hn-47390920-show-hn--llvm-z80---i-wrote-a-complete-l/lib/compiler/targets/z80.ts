import { CompilationResult, CompilationError } from '../CompilerEngine';

export class Z80Compiler {
  private wasmModule: WebAssembly.Module | null = null;
  private wasmInstance: WebAssembly.Instance | null = null;

  async initialize(): Promise<void> {
    try {
      // Load the WASM module for Z80 compilation
      const response = await fetch('lib/compiler/wasm/z80-toolchain.wasm');
      const buffer = await response.arrayBuffer();
      this.wasmModule = await WebAssembly.compile(buffer);
      this.wasmInstance = await WebAssembly.instantiate(this.wasmModule, {
        env: {
          memory: new WebAssembly.Memory({ initial: 256 }),
          table: new WebAssembly.Table({ initial: 1, element: 'anyfunc' }),
        }
      });
    } catch (error) {
      console.error('Failed to initialize Z80 compiler:', error);
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
      logs.push('[INFO] Compiling Z80 code...');

      // Get the WASM exports
      const exports = this.wasmInstance!.exports as any;

      // Allocate memory for the input code
      const codePtr = exports.allocate(code.length + 1);
      const codeView = new Uint8Array(exports.memory.buffer, codePtr, code.length + 1);
      for (let i = 0; i < code.length; i++) {
        codeView[i] = code.charCodeAt(i);
      }
      codeView[code.length] = 0; // Null-terminate

      // Call the compile function
      const result = exports.compile_z80(codePtr);

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
      const address = i.toString(16).padStart(8, '0');
      const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
      const ascii = Array.from(chunk).map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join('');

      hexDump += `${address}  ${hex.padEnd(47, ' ')}  ${ascii}\n`;
    }
    return hexDump;
  }

  // Z80-specific syntax validation
  validateSyntax(code: string): CompilationError[] {
    const errors: CompilationError[] = [];
    const lines = code.split('\n');

    // Check for common Z80 syntax errors
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check for invalid opcodes
      const opcodeMatch = line.match(/^\s*([A-Za-z]+)/);
      if (opcodeMatch) {
        const opcode = opcodeMatch[1].toUpperCase();
        const validOpcodes = [
          'LD', 'ADD', 'ADC', 'SUB', 'SBC', 'AND', 'OR', 'XOR', 'CP',
          'INC', 'DEC', 'PUSH', 'POP', 'CALL', 'RET', 'JP', 'JR',
          'NOP', 'HALT', 'DI', 'EI', 'IM', 'RLCA', 'RLA', 'RRCA',
          'RRA', 'RLC', 'RL', 'RRC', 'RR', 'SLA', 'SRA', 'SRL',
          'BIT', 'SET', 'RES', 'IN', 'OUT', 'EX', 'EXX', 'LDI',
          'LDIR', 'LDD', 'LDDR', 'CPI', 'CPIR', 'CPD', 'CPDR'
        ];

        if (!validOpcodes.includes(opcode)) {
          errors.push({
            line: i + 1,
            column: 0,
            message: `Invalid Z80 opcode: ${opcode}`,
            severity: 'error'
          });
        }
      }

      // Check for missing operands
      if (line.match(/^\s*(LD|ADD|ADC|SUB|SBC|AND|OR|XOR|CP|INC|DEC|PUSH|POP|CALL|JP|JR|IN|OUT)\s*$/i)) {
        errors.push({
          line: i + 1,
          column: 0,
          message: 'Missing operand for instruction',
          severity: 'error'
        });
      }

      // Check for invalid register names
      const registerMatch = line.match(/([A-Za-z]+)/g);
      if (registerMatch) {
        const validRegisters = [
          'A', 'B', 'C', 'D', 'E', 'H', 'L', 'AF', 'BC', 'DE', 'HL',
          'IX', 'IY', 'SP', 'PC', 'AF\'', 'BC\'', 'DE\'', 'HL\'',
          'I', 'R', 'IXH', 'IXL', 'IYH', 'IYL'
        ];

        registerMatch.forEach(reg => {
          if (reg.length > 1 && !validRegisters.includes(reg.toUpperCase())) {
            errors.push({
              line: i + 1,
              column: line.indexOf(reg),
              message: `Invalid Z80 register: ${reg}`,
              severity: 'error'
            });
          }
        });
      }
    }

    return errors;
  }
}
