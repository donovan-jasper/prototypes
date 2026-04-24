import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useExtraction from '../hooks/useExtraction';

const ExtractionScreen = ({ route }) => {
  const { text } = route.params;
  const { data, extractData } = useExtraction();

  React.useEffect(() => {
    extractData(text);
  }, [text]);

  return (
    <View style={styles.container}>
      {data ? (
        <Text>Extracted Data: {JSON.stringify(data)}</Text>
      ) : (
        <Text>Extracting data...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});

export default ExtractionScreen;
