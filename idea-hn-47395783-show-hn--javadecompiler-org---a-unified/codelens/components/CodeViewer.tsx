import React from 'react';
import { ScrollView, Text, StyleSheet, View } from 'react-native';
import { SecurityBadge } from './SecurityBadge';

interface CodeViewerProps {
  code: string;
  language?: string;
  vulnerableLines?: number[];
  onLinePress?: (lineNumber: number) => void;
}

const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  vulnerableLines = [],
  onLinePress
}) => {
  const lines = code.split('\n');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {lines.map((line, index) => {
        const lineNumber = index + 1;
        const isVulnerable = vulnerableLines.includes(lineNumber);

        return (
          <View
            key={`line-${index}`}
            style={[
              styles.lineContainer,
              isVulnerable && styles.vulnerableLine
            ]}
          >
            <Text style={styles.lineNumber}>{lineNumber}</Text>
            <Text
              style={[
                styles.code,
                isVulnerable && styles.vulnerableCode
              ]}
              onPress={() => onLinePress && onLinePress(lineNumber)}
            >
              {line}
            </Text>
            {isVulnerable && (
              <View style={styles.vulnerableIndicator}>
                <SecurityBadge severity="high" size="small" />
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
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },
  vulnerableLine: {
    backgroundColor: '#fff5f5',
  },
  lineNumber: {
    fontFamily: 'Courier',
    fontSize: 12,
    color: '#999',
    width: 40,
    textAlign: 'right',
    marginRight: 8,
  },
  code: {
    fontFamily: 'Courier',
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
    flex: 1,
  },
  vulnerableCode: {
    color: '#d32f2f',
  },
  vulnerableIndicator: {
    marginLeft: 8,
  },
});

export default CodeViewer;
