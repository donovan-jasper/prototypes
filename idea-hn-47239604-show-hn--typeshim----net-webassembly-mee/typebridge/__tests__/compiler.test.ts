import { validateWasmOutput, convertToAssemblyScript } from '../lib/compiler';

describe('WASM Compiler', () => {
  it('should validate WASM output format', () => {
    const validWasm = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
    expect(validateWasmOutput(validWasm)).toBe(true);
  });

  it('should reject invalid WASM magic number', () => {
    const invalidWasm = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    expect(validateWasmOutput(invalidWasm)).toBe(false);
  });

  it('should reject empty WASM bytes', () => {
    const emptyWasm = new Uint8Array([]);
    expect(validateWasmOutput(emptyWasm)).toBe(false);
  });

  it('should convert TypeScript to AssemblyScript hints', () => {
    const code = 'function add(a, b) { return a + b; }';
    const result = convertToAssemblyScript(code);
    expect(result).toContain('export function');
  });
});
