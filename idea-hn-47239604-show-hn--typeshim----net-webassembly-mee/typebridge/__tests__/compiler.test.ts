import { compileTypeScriptToWasm, validateWasmOutput } from '../lib/compiler';

describe('WASM Compiler', () => {
  it('should compile valid TypeScript to WASM', async () => {
    const code = 'export function add(a: number, b: number): number { return a + b; }';
    const result = await compileTypeScriptToWasm(code);
    expect(result.success).toBe(true);
    expect(result.wasmBytes).toBeDefined();
  });

  it('should return error for invalid TypeScript', async () => {
    const code = 'export function broken(a: number { return a; }';
    const result = await compileTypeScriptToWasm(code);
    expect(result.success).toBe(false);
    expect(result.error).toContain('syntax');
  });

  it('should validate WASM output format', () => {
    const validWasm = new Uint8Array([0x00, 0x61, 0x73, 0x6d]); // WASM magic number
    expect(validateWasmOutput(validWasm)).toBe(true);
  });
});
