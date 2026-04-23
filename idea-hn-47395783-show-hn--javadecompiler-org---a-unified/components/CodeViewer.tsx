import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import { SecurityFinding } from '../lib/security/scanner';

interface CodeViewerProps {
  code: string;
  language: string;
  securityFindings?: SecurityFinding[];
  onLinePress?: (lineNumber: number) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language,
  securityFindings = [],
  onLinePress
}) => {
  const lines = code.split('\n');
  const findingsByLine = securityFindings.reduce((acc, finding) => {
    if (finding.lineNumber) {
      acc[finding.lineNumber] = finding;
    }
    return acc;
  }, {} as Record<number, SecurityFinding>);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const finding = findingsByLine[lineNumber];
        const isVulnerable = !!finding;

        return (
          <View
            key={index}
            style={[
              styles.lineContainer,
              isVulnerable && styles.vulnerableLine
            ]}
          >
            <Text
              style={[
                styles.lineNumber,
                isVulnerable && styles.vulnerableLineNumber
              ]}
              onPress={() => onLinePress?.(lineNumber)}
            >
              {lineNumber}
            </Text>
            <View style={styles.codeContent}>
              <SyntaxHighlighter
                language={language}
                style={docco}
                customStyle={styles.syntaxHighlighter}
                highlighter={"hljs"}
              >
                {line}
              </SyntaxHighlighter>
            </View>
            {isVulnerable && (
              <View style={styles.vulnerabilityIndicator}>
                <Text style={styles.vulnerabilityText}>{finding.type}</Text>
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  contentContainer: {
    padding: 16,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  vulnerableLine: {
    backgroundColor: '#fff0f0',
    borderLeftWidth: 3,
    borderLeftColor: '#ff4444',
  },
  lineNumber: {
    width: 40,
    textAlign: 'right',
    color: '#999',
    fontFamily: 'monospace',
    fontSize: 12,
    paddingRight: 8,
  },
  vulnerableLineNumber: {
    color: '#ff4444',
    fontWeight: 'bold',
  },
  codeContent: {
    flex: 1,
  },
  syntaxHighlighter: {
    margin: 0,
    padding: 0,
    backgroundColor: 'transparent',
    fontSize: 12,
  },
  vulnerabilityIndicator: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  vulnerabilityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default CodeViewer;
