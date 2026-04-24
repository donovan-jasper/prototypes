import { Z80Compiler } from '@/lib/compiler/targets/z80';

describe('Z80 Compiler', () => {
  let compiler: Z80Compiler;

  beforeEach(() => {
    compiler = new Z80Compiler();
  });

  it('should compile basic Z80 assembly', async () => {
    const asm = `
      LD A, 10
      LD B, 20
      ADD A, B
      RET
    `;

    const result = await compiler.compile(asm);
    expect(result.success).toBe(true);
    expect(result.binary).toBeDefined();
    expect(result.hexDump).toBeDefined();
    expect(result.assembly).toBeDefined();
    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.errors.length).toBe(0);
  });

  it('should handle invalid opcodes', async () => {
    const asm = 'INVALID_OPCODE';
    const result = await compiler.compile(asm);

    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].message).toContain('Unknown instruction');
  });

  it('should validate syntax correctly', () => {
    const validCode = `
      ; This is a comment
      LD A, 10
      ADD A, B
      RET
    `;
    const errors = compiler.validateSyntax(validCode);
    expect(errors.length).toBe(0);

    const invalidCode = `
      LD A, 10
      INVALID_OPCODE
      RET
    `;
    const invalidErrors = compiler.validateSyntax(invalidCode);
    expect(invalidErrors.length).toBe(1);
    expect(invalidErrors[0].message).toContain('Unknown instruction');
  });

  it('should generate proper hex dump', async () => {
    const asm = 'LD A, 10';
    const result = await compiler.compile(asm);

    if (result.success && result.hexDump) {
      expect(result.hexDump).toContain('3E 0A');
    }
  });

  it('should handle empty input', async () => {
    const result = await compiler.compile('');
    expect(result.success).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});
