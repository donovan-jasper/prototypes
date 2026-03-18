import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

interface CodeViewerProps {
  code: string;
  language?: string;
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.code}>{code}</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
  },
});

export default CodeViewer;
