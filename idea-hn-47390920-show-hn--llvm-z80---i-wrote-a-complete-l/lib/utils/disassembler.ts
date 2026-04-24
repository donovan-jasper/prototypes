export class Disassembler {
  private target: string;

  constructor(target: string) {
    this.target = target;
  }

  disassemble(buffer: Uint8Array): string {
    let output = '';
    let i = 0;

    while (i < buffer.length) {
      const byte = buffer[i];
      const address = i.toString(16).padStart(4, '0');
      output += `${address}: ${byte.toString(16).padStart(2, '0')}  `;

      // Simple disassembly based on target architecture
      switch (this.target) {
        case 'x86':
          output += this.disassembleX86(buffer, i);
          break;
        case 'arm':
          output += this.disassembleARM(buffer, i);
          break;
        case 'z80':
          output += this.disassembleZ80(buffer, i);
          break;
        case 'mos6502':
          output += this.disassemble6502(buffer, i);
          break;
        default:
          output += 'db ' + byte.toString(16);
      }

      output += '\n';
      i++;
    }

    return output;
  }

  private disassembleX86(buffer: Uint8Array, offset: number): string {
    const byte = buffer[offset];
    let instruction = '';

    switch (byte) {
      case 0xB8: // MOV EAX, imm32
        instruction = 'mov eax, ';
        if (offset + 4 < buffer.length) {
          const imm = buffer[offset+1] | (buffer[offset+2] << 8) |
                     (buffer[offset+3] << 16) | (buffer[offset+4] << 24);
          instruction += imm.toString(16);
          offset += 4;
        } else {
          instruction += '????';
        }
        break;
      case 0xC3: // RET
        instruction = 'ret';
        break;
      case 0x90: // NOP
        instruction = 'nop';
        break;
      default:
        instruction = 'db ' + byte.toString(16);
    }

    return instruction;
  }

  private disassembleARM(buffer: Uint8Array, offset: number): string {
    // Simplified ARM disassembly
    const byte = buffer[offset];
    let instruction = '';

    if ((byte & 0x0F) === 0x0D) { // Branch instructions
      const imm = (buffer[offset] & 0xFF) << 24 | (buffer[offset+1] << 16) |
                 (buffer[offset+2] << 8) | buffer[offset+3];
      const signedImm = imm << 2 >> 2; // Sign extend
      instruction = `b ${(offset + 8 + signedImm).toString(16)}`;
      offset += 3;
    } else {
      instruction = 'db ' + byte.toString(16);
    }

    return instruction;
  }

  private disassembleZ80(buffer: Uint8Array, offset: number): string {
    // Simplified Z80 disassembly
    const byte = buffer[offset];
    let instruction = '';

    switch (byte) {
      case 0x3E: // LD A,n
        instruction = 'ld a, ';
        if (offset + 1 < buffer.length) {
          instruction += buffer[offset+1].toString(16);
          offset++;
        } else {
          instruction += '??';
        }
        break;
      case 0xC9: // RET
        instruction = 'ret';
        break;
      case 0x00: // NOP
        instruction = 'nop';
        break;
      default:
        instruction = 'db ' + byte.toString(16);
    }

    return instruction;
  }

  private disassemble6502(buffer: Uint8Array, offset: number): string {
    // Simplified 6502 disassembly
    const byte = buffer[offset];
    let instruction = '';

    switch (byte) {
      case 0xA9: // LDA #imm
        instruction = 'lda #';
        if (offset + 1 < buffer.length) {
          instruction += buffer[offset+1].toString(16);
          offset++;
        } else {
          instruction += '??';
        }
        break;
      case 0x60: // RTS
        instruction = 'rts';
        break;
      case 0xEA: // NOP
        instruction = 'nop';
        break;
      default:
        instruction = 'db ' + byte.toString(16);
    }

    return instruction;
  }
}
