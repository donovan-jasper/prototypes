import { JavaClassFileReader } from 'java-class-tools';

interface MethodInfo {
  name: string;
  descriptor: string;
  accessFlags: number;
  code?: string;
}

interface ClassInfo {
  className: string;
  superClass: string;
  interfaces: string[];
  fields: Array<{ name: string; descriptor: string; accessFlags: number }>;
  methods: MethodInfo[];
}

const ACCESS_FLAGS = {
  PUBLIC: 0x0001,
  PRIVATE: 0x0002,
  PROTECTED: 0x0004,
  STATIC: 0x0008,
  FINAL: 0x0010,
  SYNCHRONIZED: 0x0020,
  VOLATILE: 0x0040,
  TRANSIENT: 0x0080,
  NATIVE: 0x0100,
  ABSTRACT: 0x0400,
};

const getAccessModifiers = (flags: number): string[] => {
  const modifiers: string[] = [];
  if (flags & ACCESS_FLAGS.PUBLIC) modifiers.push('public');
  if (flags & ACCESS_FLAGS.PRIVATE) modifiers.push('private');
  if (flags & ACCESS_FLAGS.PROTECTED) modifiers.push('protected');
  if (flags & ACCESS_FLAGS.STATIC) modifiers.push('static');
  if (flags & ACCESS_FLAGS.FINAL) modifiers.push('final');
  if (flags & ACCESS_FLAGS.SYNCHRONIZED) modifiers.push('synchronized');
  if (flags & ACCESS_FLAGS.VOLATILE) modifiers.push('volatile');
  if (flags & ACCESS_FLAGS.TRANSIENT) modifiers.push('transient');
  if (flags & ACCESS_FLAGS.NATIVE) modifiers.push('native');
  if (flags & ACCESS_FLAGS.ABSTRACT) modifiers.push('abstract');
  return modifiers;
};

const parseDescriptor = (descriptor: string): { returnType: string; params: string[] } => {
  const match = descriptor.match(/\((.*?)\)(.+)/);
  if (!match) return { returnType: 'void', params: [] };
  
  const paramString = match[1];
  const returnType = parseType(match[2]);
  const params: string[] = [];
  
  let i = 0;
  while (i < paramString.length) {
    const { type, consumed } = parseTypeWithLength(paramString.substring(i));
    params.push(type);
    i += consumed;
  }
  
  return { returnType, params };
};

const parseTypeWithLength = (descriptor: string): { type: string; consumed: number } => {
  if (descriptor[0] === 'L') {
    const end = descriptor.indexOf(';');
    const className = descriptor.substring(1, end).replace(/\//g, '.');
    return { type: className, consumed: end + 1 };
  }
  
  const primitives: { [key: string]: string } = {
    'B': 'byte',
    'C': 'char',
    'D': 'double',
    'F': 'float',
    'I': 'int',
    'J': 'long',
    'S': 'short',
    'Z': 'boolean',
    'V': 'void',
  };
  
  if (descriptor[0] === '[') {
    const { type, consumed } = parseTypeWithLength(descriptor.substring(1));
    return { type: type + '[]', consumed: consumed + 1 };
  }
  
  return { type: primitives[descriptor[0]] || 'Object', consumed: 1 };
};

const parseType = (descriptor: string): string => {
  return parseTypeWithLength(descriptor).type;
};

const decompileBytecode = (bytecode: Buffer, constantPool: any[]): string => {
  const instructions: string[] = [];
  let offset = 0;
  
  while (offset < bytecode.length) {
    const opcode = bytecode[offset];
    const instruction = decompileInstruction(opcode, bytecode, offset, constantPool);
    instructions.push(`    ${instruction}`);
    offset += getInstructionLength(opcode, bytecode, offset);
  }
  
  return instructions.join('\n');
};

const decompileInstruction = (opcode: number, bytecode: Buffer, offset: number, constantPool: any[]): string => {
  const opcodes: { [key: number]: string } = {
    0x00: 'nop',
    0x01: 'aconst_null',
    0x02: 'iconst_m1',
    0x03: 'iconst_0',
    0x04: 'iconst_1',
    0x05: 'iconst_2',
    0x10: 'bipush',
    0x12: 'ldc',
    0x15: 'iload',
    0x19: 'aload',
    0x1a: 'iload_0',
    0x1b: 'iload_1',
    0x2a: 'aload_0',
    0x2b: 'aload_1',
    0x36: 'istore',
    0x3a: 'astore',
    0x3b: 'istore_0',
    0x3c: 'istore_1',
    0x4b: 'astore_0',
    0x4c: 'astore_1',
    0x57: 'pop',
    0x59: 'dup',
    0x60: 'iadd',
    0x64: 'isub',
    0x68: 'imul',
    0x6c: 'idiv',
    0x84: 'iinc',
    0x99: 'ifeq',
    0x9a: 'ifne',
    0x9b: 'iflt',
    0x9c: 'ifge',
    0x9d: 'ifgt',
    0x9e: 'ifle',
    0x9f: 'if_icmpeq',
    0xa0: 'if_icmpne',
    0xa2: 'if_icmpge',
    0xa3: 'if_icmpgt',
    0xa4: 'if_icmple',
    0xa7: 'goto',
    0xac: 'ireturn',
    0xb0: 'areturn',
    0xb1: 'return',
    0xb2: 'getstatic',
    0xb3: 'putstatic',
    0xb4: 'getfield',
    0xb5: 'putfield',
    0xb6: 'invokevirtual',
    0xb7: 'invokespecial',
    0xb8: 'invokestatic',
    0xbb: 'new',
    0xbd: 'anewarray',
    0xbe: 'arraylength',
    0xc0: 'checkcast',
    0xc1: 'instanceof',
  };
  
  const mnemonic = opcodes[opcode] || `unknown_${opcode.toString(16)}`;
  
  if (opcode === 0x12) {
    const index = bytecode[offset + 1];
    const constant = constantPool[index];
    return `${mnemonic} ${JSON.stringify(constant)}`;
  }
  
  if (opcode === 0xb6 || opcode === 0xb7 || opcode === 0xb8) {
    const index = bytecode.readUInt16BE(offset + 1);
    return `${mnemonic} #${index}`;
  }
  
  if (opcode === 0xb2 || opcode === 0xb4) {
    const index = bytecode.readUInt16BE(offset + 1);
    return `${mnemonic} #${index}`;
  }
  
  return mnemonic;
};

const getInstructionLength = (opcode: number, bytecode: Buffer, offset: number): number => {
  const lengths: { [key: number]: number } = {
    0x10: 2,
    0x12: 2,
    0x15: 2,
    0x19: 2,
    0x36: 2,
    0x3a: 2,
    0x84: 3,
    0x99: 3,
    0x9a: 3,
    0x9b: 3,
    0x9c: 3,
    0x9d: 3,
    0x9e: 3,
    0x9f: 3,
    0xa0: 3,
    0xa2: 3,
    0xa3: 3,
    0xa4: 3,
    0xa7: 3,
    0xb2: 3,
    0xb3: 3,
    0xb4: 3,
    0xb5: 3,
    0xb6: 3,
    0xb7: 3,
    0xb8: 3,
    0xbb: 3,
    0xbd: 3,
    0xc0: 3,
    0xc1: 3,
  };
  
  return lengths[opcode] || 1;
};

export const decompileJavaClass = async (bytecode: Buffer): Promise<string> => {
  try {
    const reader = new JavaClassFileReader();
    const classFile = reader.read(bytecode);
    
    const classInfo: ClassInfo = {
      className: classFile.this_class || 'UnknownClass',
      superClass: classFile.super_class || 'java.lang.Object',
      interfaces: classFile.interfaces || [],
      fields: (classFile.fields || []).map((field: any) => ({
        name: field.name || 'unknown',
        descriptor: field.descriptor || 'Ljava/lang/Object;',
        accessFlags: field.access_flags || 0,
      })),
      methods: (classFile.methods || []).map((method: any) => ({
        name: method.name || 'unknown',
        descriptor: method.descriptor || '()V',
        accessFlags: method.access_flags || 0,
        code: method.code ? decompileBytecode(method.code, classFile.constant_pool || []) : undefined,
      })),
    };
    
    return generateJavaSource(classInfo);
  } catch (error) {
    throw new Error(`Failed to decompile Java class: ${error.message}`);
  }
};

const generateJavaSource = (classInfo: ClassInfo): string => {
  const lines: string[] = [];
  
  const packageName = classInfo.className.includes('.') 
    ? classInfo.className.substring(0, classInfo.className.lastIndexOf('.'))
    : '';
  
  if (packageName) {
    lines.push(`package ${packageName};`);
    lines.push('');
  }
  
  const simpleClassName = classInfo.className.includes('.')
    ? classInfo.className.substring(classInfo.className.lastIndexOf('.') + 1)
    : classInfo.className;
  
  let classDeclaration = `public class ${simpleClassName}`;
  
  if (classInfo.superClass && classInfo.superClass !== 'java.lang.Object') {
    classDeclaration += ` extends ${classInfo.superClass}`;
  }
  
  if (classInfo.interfaces.length > 0) {
    classDeclaration += ` implements ${classInfo.interfaces.join(', ')}`;
  }
  
  lines.push(classDeclaration + ' {');
  lines.push('');
  
  for (const field of classInfo.fields) {
    const modifiers = getAccessModifiers(field.accessFlags).join(' ');
    const type = parseType(field.descriptor);
    lines.push(`  ${modifiers} ${type} ${field.name};`);
  }
  
  if (classInfo.fields.length > 0) {
    lines.push('');
  }
  
  for (const method of classInfo.methods) {
    const modifiers = getAccessModifiers(method.accessFlags).join(' ');
    const { returnType, params } = parseDescriptor(method.descriptor);
    const paramList = params.map((p, i) => `${p} param${i}`).join(', ');
    
    lines.push(`  ${modifiers} ${returnType} ${method.name}(${paramList}) {`);
    
    if (method.code) {
      lines.push(method.code);
    } else {
      lines.push('    // Native or abstract method');
    }
    
    lines.push('  }');
    lines.push('');
  }
  
  lines.push('}');
  
  return lines.join('\n');
};
