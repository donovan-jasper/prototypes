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
    const methodRef = constantPool[index];
    if (methodRef) {
      const className = methodRef.className.replace(/\//g, '.');
      const methodName = methodRef.nameAndType.name;
      const descriptor = methodRef.nameAndType.descriptor;
      return `${mnemonic} ${className}.${methodName}${descriptor}`;
    }
    return `${mnemonic} #${index}`;
  }

  if (opcode === 0xb2 || opcode === 0xb4) {
    const index = bytecode.readUInt16BE(offset + 1);
    const fieldRef = constantPool[index];
    if (fieldRef) {
      const className = fieldRef.className.replace(/\//g, '.');
      const fieldName = fieldRef.nameAndType.name;
      const fieldType = parseType(fieldRef.nameAndType.descriptor);
      return `${mnemonic} ${className}.${fieldName} : ${fieldType}`;
    }
    return `${mnemonic} #${index}`;
  }

  if (opcode === 0xbb) {
    const index = bytecode.readUInt16BE(offset + 1);
    const classRef = constantPool[index];
    if (classRef) {
      const className = classRef.name.replace(/\//g, '.');
      return `${mnemonic} ${className}`;
    }
    return `${mnemonic} #${index}`;
  }

  if (opcode === 0x10) {
    const value = bytecode.readInt8(offset + 1);
    return `${mnemonic} ${value}`;
  }

  if (opcode === 0x15 || opcode === 0x19 || opcode === 0x36 || opcode === 0x3a) {
    const index = bytecode[offset + 1];
    return `${mnemonic} ${index}`;
  }

  if (opcode === 0x84) {
    const index = bytecode[offset + 1];
    const constValue = bytecode.readInt8(offset + 2);
    return `${mnemonic} ${index}, ${constValue}`;
  }

  if (opcode === 0x99 || opcode === 0x9a || opcode === 0x9b || opcode === 0x9c ||
      opcode === 0x9d || opcode === 0x9e || opcode === 0x9f || opcode === 0xa0 ||
      opcode === 0xa1 || opcode === 0xa2 || opcode === 0xa3 || opcode === 0xa4 ||
      opcode === 0xa5 || opcode === 0xa6) {
    const branchOffset = bytecode.readInt16BE(offset + 1);
    return `${mnemonic} ${offset + branchOffset + 3}`;
  }

  if (opcode === 0xa7) {
    const branchOffset = bytecode.readInt16BE(offset + 1);
    return `${mnemonic} ${offset + branchOffset + 3}`;
  }

  return mnemonic;
};

const getInstructionLength = (opcode: number, bytecode: Buffer, offset: number): number => {
  if (opcode === 0x12) return 2;
  if (opcode === 0xb6 || opcode === 0xb7 || opcode === 0xb8 ||
      opcode === 0xb2 || opcode === 0xb4 || opcode === 0xbb ||
      opcode === 0xbd || opcode === 0xc0 || opcode === 0xc1) return 3;
  if (opcode === 0x10 || opcode === 0x15 || opcode === 0x19 ||
      opcode === 0x36 || opcode === 0x3a) return 2;
  if (opcode === 0x84) return 3;
  if (opcode >= 0x99 && opcode <= 0xa7) return 3;
  return 1;
};

const parseConstantPool = (buffer: Buffer, constantPoolCount: number): any[] => {
  const constantPool: any[] = [null];
  let offset = 10;

  for (let i = 1; i < constantPoolCount; i++) {
    const tag = buffer[offset++];

    switch (tag) {
      case 1: // UTF-8
        const length = buffer.readUInt16BE(offset);
        offset += 2;
        const bytes = buffer.subarray(offset, offset + length);
        constantPool[i] = bytes.toString('utf8');
        offset += length;
        break;

      case 3: // Integer
        constantPool[i] = buffer.readInt32BE(offset);
        offset += 4;
        break;

      case 4: // Float
        constantPool[i] = buffer.readFloatBE(offset);
        offset += 4;
        break;

      case 5: // Long
        constantPool[i] = buffer.readBigInt64BE(offset);
        offset += 8;
        i++; // Long takes two entries
        break;

      case 6: // Double
        constantPool[i] = buffer.readDoubleBE(offset);
        offset += 8;
        i++; // Double takes two entries
        break;

      case 7: // Class
        constantPool[i] = {
          tag: 'Class',
          nameIndex: buffer.readUInt16BE(offset)
        };
        offset += 2;
        break;

      case 8: // String
        constantPool[i] = {
          tag: 'String',
          stringIndex: buffer.readUInt16BE(offset)
        };
        offset += 2;
        break;

      case 9: // Fieldref
        constantPool[i] = {
          tag: 'Fieldref',
          classIndex: buffer.readUInt16BE(offset),
          nameAndTypeIndex: buffer.readUInt16BE(offset + 2)
        };
        offset += 4;
        break;

      case 10: // Methodref
        constantPool[i] = {
          tag: 'Methodref',
          classIndex: buffer.readUInt16BE(offset),
          nameAndTypeIndex: buffer.readUInt16BE(offset + 2)
        };
        offset += 4;
        break;

      case 11: // InterfaceMethodref
        constantPool[i] = {
          tag: 'InterfaceMethodref',
          classIndex: buffer.readUInt16BE(offset),
          nameAndTypeIndex: buffer.readUInt16BE(offset + 2)
        };
        offset += 4;
        break;

      case 12: // NameAndType
        constantPool[i] = {
          tag: 'NameAndType',
          nameIndex: buffer.readUInt16BE(offset),
          descriptorIndex: buffer.readUInt16BE(offset + 2)
        };
        offset += 4;
        break;

      default:
        console.warn(`Unknown constant pool tag: ${tag}`);
        offset += 2;
        break;
    }
  }

  // Resolve references
  for (let i = 1; i < constantPool.length; i++) {
    const entry = constantPool[i];
    if (!entry) continue;

    if (entry.tag === 'Class') {
      entry.name = constantPool[entry.nameIndex];
    } else if (entry.tag === 'String') {
      entry.string = constantPool[entry.stringIndex];
    } else if (entry.tag === 'Fieldref' || entry.tag === 'Methodref' || entry.tag === 'InterfaceMethodref') {
      const classEntry = constantPool[entry.classIndex];
      const nameAndTypeEntry = constantPool[entry.nameAndTypeIndex];

      entry.className = classEntry.name;
      entry.nameAndType = {
        name: constantPool[nameAndTypeEntry.nameIndex],
        descriptor: constantPool[nameAndTypeEntry.descriptorIndex]
      };
    }
  }

  return constantPool;
};

const parseAttributes = (buffer: Buffer, offset: number, constantPool: any[]): any[] => {
  const attributesCount = buffer.readUInt16BE(offset);
  offset += 2;
  const attributes: any[] = [];

  for (let i = 0; i < attributesCount; i++) {
    const attributeNameIndex = buffer.readUInt16BE(offset);
    const attributeLength = buffer.readUInt32BE(offset + 2);
    const attributeName = constantPool[attributeNameIndex];

    offset += 6;

    if (attributeName === 'Code') {
      const maxStack = buffer.readUInt16BE(offset);
      const maxLocals = buffer.readUInt16BE(offset + 2);
      const codeLength = buffer.readUInt32BE(offset + 4);
      const code = buffer.subarray(offset + 8, offset + 8 + codeLength);

      attributes.push({
        name: 'Code',
        maxStack,
        maxLocals,
        codeLength,
        code
      });

      offset += 8 + codeLength;
    } else if (attributeName === 'SourceFile') {
      const sourceFileIndex = buffer.readUInt16BE(offset);
      attributes.push({
        name: 'SourceFile',
        sourceFile: constantPool[sourceFileIndex]
      });
      offset += 2;
    } else {
      // Skip other attributes
      offset += attributeLength;
    }
  }

  return attributes;
};

export const decompileJavaClass = async (classBuffer: Buffer): Promise<string> => {
  if (classBuffer.readUInt32BE(0) !== 0xCAFEBABE) {
    throw new Error('Invalid Java class file');
  }

  const minorVersion = classBuffer.readUInt16BE(4);
  const majorVersion = classBuffer.readUInt16BE(6);
  const constantPoolCount = classBuffer.readUInt16BE(8);

  const constantPool = parseConstantPool(classBuffer, constantPoolCount);

  let offset = 10 + (constantPoolCount - 1) * 3; // Approximate offset after constant pool

  const accessFlags = classBuffer.readUInt16BE(offset);
  offset += 2;

  const thisClassIndex = classBuffer.readUInt16BE(offset);
  offset += 2;

  const superClassIndex = classBuffer.readUInt16BE(offset);
  offset += 2;

  const interfacesCount = classBuffer.readUInt16BE(offset);
  offset += 2;

  const interfaces: string[] = [];
  for (let i = 0; i < interfacesCount; i++) {
    const interfaceIndex = classBuffer.readUInt16BE(offset);
    offset += 2;
    interfaces.push(constantPool[interfaceIndex].name.replace(/\//g, '.'));
  }

  const fieldsCount = classBuffer.readUInt16BE(offset);
  offset += 2;

  const fields: ClassInfo['fields'] = [];
  for (let i = 0; i < fieldsCount; i++) {
    const fieldAccessFlags = classBuffer.readUInt16BE(offset);
    offset += 2;

    const fieldNameIndex = classBuffer.readUInt16BE(offset);
    offset += 2;

    const fieldDescriptorIndex = classBuffer.readUInt16BE(offset);
    offset += 2;

    const fieldAttributesCount = classBuffer.readUInt16BE(offset);
    offset += 2;

    // Skip attributes for now
    for (let j = 0; j < fieldAttributesCount; j++) {
      const attributeNameIndex = classBuffer.readUInt16BE(offset);
      const attributeLength = classBuffer.readUInt32BE(offset + 2);
      offset += 6 + attributeLength;
    }

    fields.push({
      name: constantPool[fieldNameIndex],
      descriptor: constantPool[fieldDescriptorIndex],
      accessFlags: fieldAccessFlags
    });
  }

  const methodsCount = classBuffer.readUInt16BE(offset);
  offset += 2;

  const methods: MethodInfo[] = [];
  for (let i = 0; i < methodsCount; i++) {
    const methodAccessFlags = classBuffer.readUInt16BE(offset);
    offset += 2;

    const methodNameIndex = classBuffer.readUInt16BE(offset);
    offset += 2;

    const methodDescriptorIndex = classBuffer.readUInt16BE(offset);
    offset += 2;

    const methodAttributes = parseAttributes(classBuffer, offset, constantPool);
    offset += 2; // Skip attributes count

    let codeAttribute = null;
    for (const attr of methodAttributes) {
      if (attr.name === 'Code') {
        codeAttribute = attr;
        break;
      }
    }

    methods.push({
      name: constantPool[methodNameIndex],
      descriptor: constantPool[methodDescriptorIndex],
      accessFlags: methodAccessFlags,
      code: codeAttribute ? decompileBytecode(codeAttribute.code, constantPool) : undefined
    });

    // Skip remaining attributes
    for (const attr of methodAttributes) {
      if (attr.name === 'Code') {
        offset += 8 + attr.codeLength;
      } else if (attr.name === 'SourceFile') {
        offset += 2;
      } else {
        offset += attr.length;
      }
    }
  }

  const classInfo: ClassInfo = {
    className: constantPool[thisClassIndex].name.replace(/\//g, '.'),
    superClass: superClassIndex !== 0 ? constantPool[superClassIndex].name.replace(/\//g, '.') : '',
    interfaces,
    fields,
    methods
  };

  // Generate Java source code
  let javaCode = '';

  // Package declaration
  const packageName = classInfo.className.substring(0, classInfo.className.lastIndexOf('.'));
  if (packageName) {
    javaCode += `package ${packageName};\n\n`;
  }

  // Imports
  const imports = new Set<string>();
  classInfo.fields.forEach(field => {
    if (field.descriptor.startsWith('L')) {
      const importType = field.descriptor.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.');
      imports.add(importType);
    }
  });

  classInfo.methods.forEach(method => {
    const { params, returnType } = parseDescriptor(method.descriptor);
    params.forEach(param => {
      if (param.startsWith('L')) {
        const importType = param.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.');
        imports.add(importType);
      }
    });
    if (returnType.startsWith('L')) {
      const importType = returnType.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.');
      imports.add(importType);
    }
  });

  if (imports.size > 0) {
    Array.from(imports).sort().forEach(importType => {
      javaCode += `import ${importType};\n`;
    });
    javaCode += '\n';
  }

  // Class declaration
  const classModifiers = getAccessModifiers(accessFlags);
  const simpleClassName = classInfo.className.substring(classInfo.className.lastIndexOf('.') + 1);
  const extendsClause = classInfo.superClass && classInfo.superClass !== 'java.lang.Object'
    ? ` extends ${classInfo.superClass}`
    : '';
  const implementsClause = classInfo.interfaces.length > 0
    ? ` implements ${classInfo.interfaces.join(', ')}`
    : '';

  javaCode += `${classModifiers.join(' ')} class ${simpleClassName}${extendsClause}${implementsClause} {\n`;

  // Fields
  classInfo.fields.forEach(field => {
    const fieldModifiers = getAccessModifiers(field.accessFlags);
    const fieldType = parseType(field.descriptor);
    javaCode += `    ${fieldModifiers.join(' ')} ${fieldType} ${field.name};\n`;
  });

  if (classInfo.fields.length > 0) {
    javaCode += '\n';
  }

  // Methods
  classInfo.methods.forEach(method => {
    const methodModifiers = getAccessModifiers(method.accessFlags);
    const { returnType, params } = parseDescriptor(method.descriptor);
    const paramList = params.map((p, i) => `${p} arg${i}`).join(', ');

    javaCode += `    ${methodModifiers.join(' ')} ${returnType} ${method.name}(${paramList}) {\n`;

    if (method.code) {
      javaCode += method.code + '\n';
    } else {
      javaCode += '        // Method implementation not available\n';
    }

    javaCode += '    }\n\n';
  });

  javaCode += '}\n';

  return javaCode;
};
