export function toHexDump(buffer: Uint8Array): string {
  let hexDump = '';
  for (let i = 0; i < buffer.length; i += 16) {
    const chunk = buffer.slice(i, i + 16);
    const address = i.toString(16).padStart(8, '0');
    const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0')).join(' ');
    const ascii = Array.from(chunk).map(b => b >= 32 && b <= 126 ? String.fromCharCode(b) : '.').join('');

    hexDump += `${address}  ${hex.padEnd(47, ' ')}  ${ascii}\n`;
  }
  return hexDump;
}

export function toBinary(num: number, bits: number = 8): string {
  return num.toString(2).padStart(bits, '0');
}

export function parseHex(hexString: string): Uint8Array {
  // Remove all whitespace and non-hex characters
  const cleanHex = hexString.replace(/[^0-9a-fA-F]/g, '');

  // Convert to byte array
  const bytes = [];
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes.push(parseInt(cleanHex.substr(i, 2), 16));
  }

  return new Uint8Array(bytes);
}

export function disassemble(buffer: Uint8Array, target: string): string {
  // Simple disassembly for demonstration
  // In a real app, you would use a proper disassembler library
  let output = '';
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    output += `${i.toString(16).padStart(4, '0')}: ${byte.toString(16).padStart(2, '0')}  `;

    // Simple x86 disassembly (very basic)
    if (target === 'x86') {
      switch (byte) {
        case 0xB8: output += 'mov eax, '; i++; output += buffer[i].toString(16); break;
        case 0xC3: output += 'ret'; break;
        case 0x90: output += 'nop'; break;
        default: output += 'db ' + byte.toString(16);
      }
    } else {
      output += 'db ' + byte.toString(16);
    }

    output += '\n';
  }
  return output;
}
