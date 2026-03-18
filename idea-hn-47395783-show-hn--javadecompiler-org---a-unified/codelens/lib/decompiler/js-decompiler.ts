interface JSBundleResult {
  files: Array<{ path: string; content: string }>;
  code: string;
}

export const parseJSBundle = async (bundleBuffer: Buffer): Promise<JSBundleResult> => {
  const bundleContent = bundleBuffer.toString('utf8');
  const files: Array<{ path: string; content: string }> = [];
  
  // Try to extract module definitions
  const modulePattern = /__d\(function\s*\([^)]*\)\s*\{([^}]*)\}/g;
  const modules: string[] = [];
  let match;
  
  while ((match = modulePattern.exec(bundleContent)) !== null) {
    modules.push(match[1]);
  }
  
  if (modules.length > 0) {
    modules.forEach((moduleCode, index) => {
      files.push({
        path: `module_${index}.js`,
        content: beautifyJS(moduleCode),
      });
    });
  } else {
    // If no modules found, just beautify the entire bundle
    files.push({
      path: 'bundle.js',
      content: beautifyJS(bundleContent),
    });
  }
  
  const code = files.map(f => f.content).join('\n\n// ===== Next Module =====\n\n');
  
  return { files, code };
};

const beautifyJS = (code: string): string => {
  // Basic JavaScript beautification
  let beautified = code;
  
  // Add newlines after semicolons
  beautified = beautified.replace(/;/g, ';\n');
  
  // Add newlines after opening braces
  beautified = beautified.replace(/\{/g, '{\n');
  
  // Add newlines before closing braces
  beautified = beautified.replace(/\}/g, '\n}');
  
  // Basic indentation
  const lines = beautified.split('\n');
  let indentLevel = 0;
  const indentedLines = lines.map(line => {
    const trimmed = line.trim();
    if (trimmed.endsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    const indented = '  '.repeat(indentLevel) + trimmed;
    if (trimmed.endsWith('{')) {
      indentLevel++;
    }
    return indented;
  });
  
  return indentedLines.join('\n');
};
