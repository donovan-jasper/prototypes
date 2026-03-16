import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import SyntaxHighlighter from 'react-native-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const CodeViewer = ({ code }) => {
  return (
    <ScrollView style={{ flex: 1 }}>
      <SyntaxHighlighter language="java" style={docco}>
        {code}
      </SyntaxHighlighter>
    </ScrollView>
  );
};

export default CodeViewer;
