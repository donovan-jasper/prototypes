import React from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';

interface CodeEditorProps {
  value: string;
  onChange: (text: string) => void;
  language: string;
}

export default function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  return (
    <TextInput
      style={styles.editor}
      value={value}
      onChangeText={onChange}
      multiline
      autoCapitalize="none"
      autoCorrect={false}
      autoComplete="off"
      spellCheck={false}
      placeholder="// Write your code here"
      placeholderTextColor="#64748b"
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  editor: {
    flex: 1,
    backgroundColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    lineHeight: 20,
  },
});
