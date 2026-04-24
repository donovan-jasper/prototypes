import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface ConsoleOutputProps {
  logs: string[];
  onClear?: () => void;
}

const ConsoleOutput: React.FC<ConsoleOutputProps> = ({ logs, onClear }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs]);

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setAutoScroll(isAtBottom);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Console Output</Text>
        {onClear && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {logs.map((log, index) => (
          <Text key={index} style={styles.logLine}>
            {log}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#282c34',
    borderRadius: 4,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3e4451',
  },
  title: {
    color: '#abb2bf',
    fontSize: 14,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: 5,
    backgroundColor: '#5c6370',
    borderRadius: 4,
  },
  clearText: {
    color: 'white',
    fontSize: 12,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 10,
  },
  logLine: {
    color: '#abb2bf',
    fontFamily: 'Courier New',
    fontSize: 12,
    marginBottom: 4,
    lineHeight: 16,
  },
});

export default ConsoleOutput;
