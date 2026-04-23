import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

interface CodeViewerProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  startingLineNumber?: number;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  showLineNumbers = true,
  startingLineNumber = 1
}) => {
  const renderLineNumbers = () => {
    if (!showLineNumbers) return null;

    const lineCount = code.split('\n').length;
    const lines = [];

    for (let i = 0; i < lineCount; i++) {
      lines.push(
        <Text key={`line-${i}`} style={styles.lineNumber}>
          {startingLineNumber + i}
        </Text>
      );
    }

    return <View style={styles.lineNumbers}>{lines}</View>;
  };

  return (
    <View style={styles.container}>
      {renderLineNumbers()}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.codeContainer}
      >
        <SyntaxHighlighter
          language={language}
          style={docco}
          customStyle={styles.syntaxHighlighter}
          highlighter="hljs"
        >
          {code}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  lineNumbers: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#eee',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  lineNumber: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    lineHeight: 20,
  },
  codeContainer: {
    flex: 1,
  },
  syntaxHighlighter: {
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 8,
    backgroundColor: 'transparent',
  },
});

export default CodeViewer;
