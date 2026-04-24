export function validateWasmOutput(wasmBytes: Uint8Array): boolean {
  // Check for WASM magic number (0x00 0x61 0x73 0x6d)
  if (wasmBytes.length < 4) return false;
  return wasmBytes[0] === 0x00 &&
         wasmBytes[1] === 0x61 &&
         wasmBytes[2] === 0x73 &&
         wasmBytes[3] === 0x6d;
}
