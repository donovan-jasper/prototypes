import JSZip from 'jszip';
import { decompileJavaClass } from './java-decompiler';

interface DexHeader {
  magic: string;
  version: number;
  classCount: number;
  stringIdsOffset: number;
  typeIdsOffset: number;
  protoIdsOffset: number;
  fieldIdsOffset: number;
  methodIdsOffset: number;
  classDefsOffset: number;
  dataOffset: number;
  dataSize: number;
}

interface DexClass {
  className: string;
  superClass: string;
  interfaces: string[];
  accessFlags: number;
  sourceFile: string;
  fields: Array<{
    name: string;
    type: string;
    accessFlags: number;
  }>;
  methods: Array<{
    name: string;
    descriptor: string;
    accessFlags: number;
    codeOffset: number;
    codeSize: number;
  }>;
}

interface DexMethodCode {
  registersSize: number;
  insSize: number;
  outsSize: number;
  triesSize: number;
  debugInfoOffset: number;
  insnsSize: number;
  insns: Buffer;
  tries: Array<{
    startAddr: number;
    insnCount: number;
    handlerOffset: number;
  }>;
  handlers: Array<{
    size: number;
    handlers: Array<{
      typeIdx: number;
      addr: number;
    }>;
  }>;
}

const parseDexHeader = (buffer: Buffer): DexHeader => {
  const magic = buffer.toString('ascii', 0, 8);
  const version = buffer.readUInt32LE(8);
  const checksum = buffer.readUInt32LE(12);
  const signature = buffer.subarray(16, 36);
  const fileSize = buffer.readUInt32LE(36);
  const headerSize = buffer.readUInt32LE(40);
  const endianTag = buffer.readUInt32LE(44);
  const linkSize = buffer.readUInt32LE(48);
  const linkOff = buffer.readUInt32LE(52);
  const mapOff = buffer.readUInt32LE(56);
  const stringIdsSize = buffer.readUInt32LE(60);
  const stringIdsOffset = buffer.readUInt32LE(64);
  const typeIdsSize = buffer.readUInt32LE(68);
  const typeIdsOffset = buffer.readUInt32LE(72);
  const protoIdsSize = buffer.readUInt32LE(76);
  const protoIdsOffset = buffer.readUInt32LE(80);
  const fieldIdsSize = buffer.readUInt32LE(84);
  const fieldIdsOffset = buffer.readUInt32LE(88);
  const methodIdsSize = buffer.readUInt32LE(92);
  const methodIdsOffset = buffer.readUInt32LE(96);
  const classDefsSize = buffer.readUInt32LE(96);
  const classDefsOffset = buffer.readUInt32LE(100);
  const dataSize = buffer.readUInt32LE(104);
  const dataOffset = buffer.readUInt32LE(108);

  return {
    magic,
    version,
    classCount: classDefsSize,
    stringIdsOffset,
    typeIdsOffset,
    protoIdsOffset,
    fieldIdsOffset,
    methodIdsOffset,
    classDefsOffset,
    dataOffset,
    dataSize
  };
};

const readString = (buffer: Buffer, offset: number, stringIdsOffset: number): string => {
  const stringDataOffset = buffer.readUInt32LE(stringIdsOffset + offset * 4);
  if (stringDataOffset === 0) return '';

  const utf16Size = buffer.readUInt8(stringDataOffset);
  let result = '';
  let pos = stringDataOffset + 1;

  for (let i = 0; i < utf16Size; i++) {
    const char = buffer.readUInt16LE(pos);
    result += String.fromCharCode(char);
    pos += 2;
  }

  return result;
};

const readType = (buffer: Buffer, offset: number, typeIdsOffset: number, stringIdsOffset: number): string => {
  const descriptorIdx = buffer.readUInt32LE(typeIdsOffset + offset * 4);
  return readString(buffer, descriptorIdx, stringIdsOffset);
};

const parseClassDef = (buffer: Buffer, offset: number, header: DexHeader): DexClass => {
  const classIdx = buffer.readUInt32LE(offset);
  const accessFlags = buffer.readUInt32LE(offset + 4);
  const superclassIdx = buffer.readUInt32LE(offset + 8);
  const interfacesOffset = buffer.readUInt32LE(offset + 12);
  const sourceFileIdx = buffer.readUInt32LE(offset + 16);
  const annotationsOffset = buffer.readUInt32LE(offset + 20);
  const classDataOffset = buffer.readUInt32LE(offset + 24);
  const staticValuesOffset = buffer.readUInt32LE(offset + 28);

  const className = readType(buffer, classIdx, header.typeIdsOffset, header.stringIdsOffset);
  const superClass = superclassIdx !== 0xFFFFFFFF
    ? readType(buffer, superclassIdx, header.typeIdsOffset, header.stringIdsOffset)
    : '';

  const interfaces: string[] = [];
  if (interfacesOffset !== 0) {
    const interfacesSize = buffer.readUInt32LE(interfacesOffset);
    for (let i = 0; i < interfacesSize; i++) {
      const interfaceIdx = buffer.readUInt16LE(interfacesOffset + 4 + i * 2);
      interfaces.push(readType(buffer, interfaceIdx, header.typeIdsOffset, header.stringIdsOffset));
    }
  }

  const sourceFile = sourceFileIdx !== 0xFFFFFFFF
    ? readString(buffer, sourceFileIdx, header.stringIdsOffset)
    : '';

  const fields: DexClass['fields'] = [];
  const methods: DexClass['methods'] = [];

  if (classDataOffset !== 0) {
    let pos = classDataOffset;

    // Read static fields
    const staticFieldsSize = readULEB128(buffer, pos);
    pos += getULEB128Size(buffer, pos);
    for (let i = 0; i < staticFieldsSize; i++) {
      const fieldIdx = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);
      const accessFlags = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);

      const fieldName = readString(buffer, fieldIdx, header.stringIdsOffset);
      const fieldType = readType(buffer, fieldIdx, header.typeIdsOffset, header.stringIdsOffset);

      fields.push({
        name: fieldName,
        type: fieldType,
        accessFlags
      });
    }

    // Read instance fields
    const instanceFieldsSize = readULEB128(buffer, pos);
    pos += getULEB128Size(buffer, pos);
    for (let i = 0; i < instanceFieldsSize; i++) {
      const fieldIdx = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);
      const accessFlags = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);

      const fieldName = readString(buffer, fieldIdx, header.stringIdsOffset);
      const fieldType = readType(buffer, fieldIdx, header.typeIdsOffset, header.stringIdsOffset);

      fields.push({
        name: fieldName,
        type: fieldType,
        accessFlags
      });
    }

    // Read direct methods
    const directMethodsSize = readULEB128(buffer, pos);
    pos += getULEB128Size(buffer, pos);
    for (let i = 0; i < directMethodsSize; i++) {
      const methodIdx = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);
      const accessFlags = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);
      const codeOffset = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);

      const methodName = readString(buffer, methodIdx, header.stringIdsOffset);
      const methodDescriptor = readString(buffer, methodIdx + 1, header.stringIdsOffset);

      methods.push({
        name: methodName,
        descriptor: methodDescriptor,
        accessFlags,
        codeOffset,
        codeSize: 0
      });
    }

    // Read virtual methods
    const virtualMethodsSize = readULEB128(buffer, pos);
    pos += getULEB128Size(buffer, pos);
    for (let i = 0; i < virtualMethodsSize; i++) {
      const methodIdx = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);
      const accessFlags = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);
      const codeOffset = readULEB128(buffer, pos);
      pos += getULEB128Size(buffer, pos);

      const methodName = readString(buffer, methodIdx, header.stringIdsOffset);
      const methodDescriptor = readString(buffer, methodIdx + 1, header.stringIdsOffset);

      methods.push({
        name: methodName,
        descriptor: methodDescriptor,
        accessFlags,
        codeOffset,
        codeSize: 0
      });
    }
  }

  return {
    className,
    superClass,
    interfaces,
    accessFlags,
    sourceFile,
    fields,
    methods
  };
};

const readULEB128 = (buffer: Buffer, offset: number): number => {
  let result = 0;
  let shift = 0;
  let pos = offset;

  while (true) {
    const byte = buffer.readUInt8(pos++);
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }

  return result;
};

const getULEB128Size = (buffer: Buffer, offset: number): number => {
  let pos = offset;
  while (buffer.readUInt8(pos++) & 0x80) {}
  return pos - offset;
};

const parseMethodCode = (buffer: Buffer, offset: number): DexMethodCode => {
  const registersSize = buffer.readUInt16LE(offset);
  const insSize = buffer.readUInt16LE(offset + 2);
  const outsSize = buffer.readUInt16LE(offset + 4);
  const triesSize = buffer.readUInt16LE(offset + 6);
  const debugInfoOffset = buffer.readUInt32LE(offset + 8);
  const insnsSize = buffer.readUInt32LE(offset + 12);

  const insns = buffer.subarray(offset + 16, offset + 16 + insnsSize * 2);

  const tries: DexMethodCode['tries'] = [];
  const handlers: DexMethodCode['handlers'] = [];

  if (triesSize > 0) {
    const triesOffset = offset + 16 + insnsSize * 2;
    for (let i = 0; i < triesSize; i++) {
      const startAddr = buffer.readUInt32LE(triesOffset + i * 8);
      const insnCount = buffer.readUInt16LE(triesOffset + i * 8 + 4);
      const handlerOffset = buffer.readUInt16LE(triesOffset + i * 8 + 6);

      tries.push({ startAddr, insnCount, handlerOffset });
    }

    const handlersOffset = triesOffset + triesSize * 8;
    let pos = handlersOffset;

    while (pos < buffer.length) {
      const size = buffer.readInt32LE(pos);
      if (size === 0) break;

      pos += 4;
      const handlersList: DexMethodCode['handlers'][0]['handlers'] = [];

      for (let i = 0; i < Math.abs(size); i++) {
        const typeIdx = buffer.readUInt16LE(pos);
        const addr = buffer.readUInt16LE(pos + 2);
        pos += 4;

        handlersList.push({ typeIdx, addr });
      }

      handlers.push({ size, handlers: handlersList });
    }
  }

  return {
    registersSize,
    insSize,
    outsSize,
    triesSize,
    debugInfoOffset,
    insnsSize,
    insns,
    tries,
    handlers
  };
};

const decompileMethod = (method: DexClass['methods'][0], code: DexMethodCode, className: string): string => {
  const accessModifiers = getAccessModifiers(method.accessFlags);
  const { returnType, params } = parseDescriptor(method.descriptor);

  const paramList = params.map((p, i) => `${p} arg${i}`).join(', ');
  const methodSignature = `${accessModifiers.join(' ')} ${returnType} ${method.name}(${paramList})`;

  let methodBody = '{\n';

  // Simple decompilation - just show the method signature and a placeholder body
  // In a real implementation, we would analyze the bytecode to reconstruct actual logic
  methodBody += '    // Method implementation not fully decompiled\n';
  methodBody += '    // Registers: ' + code.registersSize + '\n';
  methodBody += '    // Instructions: ' + code.insnsSize + '\n';

  // Add some basic logic based on method name
  if (method.name === '<init>') {
    methodBody += '    // Constructor implementation\n';
  } else if (method.name === 'toString') {
    methodBody += '    return "Instance of ' + className + '";\n';
  } else if (method.name === 'equals') {
    methodBody += '    return this == obj;\n';
  } else if (method.name === 'hashCode') {
    methodBody += '    return System.identityHashCode(this);\n';
  }

  methodBody += '}\n';

  return methodSignature + ' ' + methodBody;
};

const getAccessModifiers = (flags: number): string[] => {
  const modifiers: string[] = [];
  if (flags & 0x0001) modifiers.push('public');
  if (flags & 0x0002) modifiers.push('private');
  if (flags & 0x0004) modifiers.push('protected');
  if (flags & 0x0008) modifiers.push('static');
  if (flags & 0x0010) modifiers.push('final');
  if (flags & 0x0020) modifiers.push('synchronized');
  if (flags & 0x0040) modifiers.push('volatile');
  if (flags & 0x0080) modifiers.push('transient');
  if (flags & 0x0100) modifiers.push('native');
  if (flags & 0x0400) modifiers.push('abstract');
  if (flags & 0x1000) modifiers.push('strictfp');
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

const decompileClass = (dexClass: DexClass, dexBuffer: Buffer, header: DexHeader): string => {
  const accessModifiers = getAccessModifiers(dexClass.accessFlags);
  const className = dexClass.className.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.');
  const packageName = className.substring(0, className.lastIndexOf('.'));
  const simpleClassName = className.substring(className.lastIndexOf('.') + 1);

  let classCode = '';

  if (packageName) {
    classCode += `package ${packageName};\n\n`;
  }

  const imports = new Set<string>();
  dexClass.fields.forEach(field => {
    if (field.type.startsWith('L')) {
      const importType = field.type.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.');
      imports.add(importType);
    }
  });

  dexClass.methods.forEach(method => {
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
      classCode += `import ${importType};\n`;
    });
    classCode += '\n';
  }

  const extendsClause = dexClass.superClass && dexClass.superClass !== 'Ljava/lang/Object;'
    ? ` extends ${dexClass.superClass.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.')}`
    : '';

  const implementsClause = dexClass.interfaces.length > 0
    ? ` implements ${dexClass.interfaces.map(i =>
        i.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.')).join(', ')}`
    : '';

  classCode += `${accessModifiers.join(' ')} class ${simpleClassName}${extendsClause}${implementsClause} {\n`;

  // Fields
  dexClass.fields.forEach(field => {
    const fieldModifiers = getAccessModifiers(field.accessFlags);
    const fieldType = parseType(field.type);
    classCode += `    ${fieldModifiers.join(' ')} ${fieldType} ${field.name};\n`;
  });

  if (dexClass.fields.length > 0) {
    classCode += '\n';
  }

  // Methods
  dexClass.methods.forEach(method => {
    if (method.codeOffset !== 0) {
      const code = parseMethodCode(dexBuffer, method.codeOffset);
      classCode += `    ${decompileMethod(method, code, className)}\n`;
    } else {
      const accessModifiers = getAccessModifiers(method.accessFlags);
      const { returnType, params } = parseDescriptor(method.descriptor);
      const paramList = params.map((p, i) => `${p} arg${i}`).join(', ');
      classCode += `    ${accessModifiers.join(' ')} ${returnType} ${method.name}(${paramList});\n\n`;
    }
  });

  classCode += '}\n';

  return classCode;
};

export const extractAPK = async (apkFile: Buffer): Promise<Array<{ path: string; content: string }>> => {
  const zip = new JSZip();
  const contents = await zip.loadAsync(apkFile);
  const files: Array<{ path: string; content: string }> = [];

  for (const [path, file] of Object.entries(contents.files)) {
    if (file.dir) continue;

    if (path.endsWith('.dex')) {
      try {
        const dexBuffer = await file.async('nodebuffer');
        const header = parseDexHeader(dexBuffer);

        if (header.magic !== 'dex\n') {
          throw new Error('Invalid DEX file format');
        }

        for (let i = 0; i < header.classCount; i++) {
          const classDefOffset = header.classDefsOffset + i * 32;
          const dexClass = parseClassDef(dexBuffer, classDefOffset, header);

          const className = dexClass.className.replace(/^L/, '').replace(/;$/, '').replace(/\//g, '.');
          const javaPath = className.replace(/\./g, '/') + '.java';

          const decompiledCode = decompileClass(dexClass, dexBuffer, header);
          files.push({ path: javaPath, content: decompiledCode });
        }
      } catch (error) {
        console.error(`Failed to process DEX file ${path}:`, error);
        files.push({ path, content: '// Error processing DEX file' });
      }
    } else if (path.endsWith('.xml') || path.endsWith('.txt') || path === 'AndroidManifest.xml') {
      try {
        const content = await file.async('text');
        files.push({ path, content });
      } catch (error) {
        files.push({ path, content: '// Binary or encrypted file' });
      }
    } else if (path.endsWith('.class')) {
      try {
        const classBuffer = await file.async('nodebuffer');
        const decompiledCode = await decompileJavaClass(classBuffer);
        const javaPath = path.replace(/\.class$/, '.java');
        files.push({ path: javaPath, content: decompiledCode });
      } catch (error) {
        console.error(`Failed to decompile ${path}:`, error);
        files.push({ path, content: '// Error decompiling class file' });
      }
    }
  }

  if (files.length === 0) {
    files.push({
      path: 'README.txt',
      content: 'APK extracted successfully. No decompilable classes found or DEX parsing encountered errors.'
    });
  }

  return files;
};
