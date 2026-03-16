import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const ComparisonView = ({ comparison }) => {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <ScrollView style={{ flex: 1 }}>
        <SyntaxHighlighter language="java" style={docco}>
          {comparison.oldCode}
        </SyntaxHighlighter>
      </ScrollView>
      <ScrollView style={{ flex: 1 }}>
        <SyntaxHighlighter language="java" style={docco}>
          {comparison.newCode}
        </SyntaxHighlighter>
      </ScrollView>
    </View>
  );
};

export default ComparisonView;
