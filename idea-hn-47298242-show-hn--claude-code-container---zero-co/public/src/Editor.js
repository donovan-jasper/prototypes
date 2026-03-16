import React, { useEffect, useRef } from 'react';

const Editor = ({ value, onChange, language }) => {
  const containerRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    let editor;

    const loadMonaco = async () => {
      // Dynamically import Monaco Editor
      const monaco = await import('monaco-editor');
      
      editor = monaco.editor.create(containerRef.current, {
        value: value || '// Write your code here\nconsole.log("Hello, CodeCapsule!");',
        language: language || 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        fontSize: 14,
        scrollBeyondLastLine: false,
        minimap: { enabled: false },
        wordWrap: 'on',
        fontFamily: 'Fira Code, monospace',
        fontLigatures: true,
      });

      editor.onDidChangeModelContent(() => {
        onChange(editor.getValue());
      });

      editorRef.current = editor;
    };

    loadMonaco();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
      }
    };
  }, [language]);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getValue()) {
      editorRef.current.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.updateOptions({ language });
    }
  }, [language]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

export default React.forwardRef((props, ref) => <Editor {...props} forwardedRef={ref} />);
