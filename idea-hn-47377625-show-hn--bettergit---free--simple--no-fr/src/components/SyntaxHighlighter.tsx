import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Prism } from 'react-native-prism';

interface SyntaxHighlighterProps {
  code: string;
  language: string;
  style?: object;
}

export const SyntaxHighlighter: React.FC<SyntaxHighlighterProps> = ({ code, language, style }) => {
  return (
    <View style={[styles.container, style]}>
      <Prism
        code={code}
        language={language}
        style={prismStyles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});

const prismStyles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
    padding: 8,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 14,
    lineHeight: 20,
  },
  comment: {
    color: '#999',
    fontStyle: 'italic',
  },
  keyword: {
    color: '#0077aa',
    fontWeight: 'bold',
  },
  string: {
    color: '#d14',
  },
  number: {
    color: '#905',
  },
  boolean: {
    color: '#0077aa',
    fontWeight: 'bold',
  },
  punctuation: {
    color: '#999',
  },
  function: {
    color: '#dd4a68',
  },
  className: {
    color: '#dd4a68',
    fontWeight: 'bold',
  },
  tag: {
    color: '#0077aa',
  },
  attribute: {
    color: '#999',
  },
  operator: {
    color: '#9a6e3a',
  },
  regex: {
    color: '#e90',
  },
  variable: {
    color: '#0077aa',
  },
});
