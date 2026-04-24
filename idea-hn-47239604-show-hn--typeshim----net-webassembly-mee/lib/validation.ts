export function validateWasmOutput(wasmBytes: Uint8Array): boolean {
  // Check for WASM magic number (0x00 0x61 0x73 0x6D)
  if (wasmBytes.length < 4) return false;
  if (wasmBytes[0] !== 0x00) return false;
  if (wasmBytes[1] !== 0x61) return false;
  if (wasmBytes[2] !== 0x73) return false;
  if (wasmBytes[3] !== 0x6D) return false;

  // Check for valid WASM version (0x01 0x00 0x00 0x00)
  if (wasmBytes.length < 8) return false;
  if (wasmBytes[4] !== 0x01) return false;
  if (wasmBytes[5] !== 0x00) return false;
  if (wasmBytes[6] !== 0x00) return false;
  if (wasmBytes[7] !== 0x00) return false;

  return true;
}
