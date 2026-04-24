import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { extractData } from '../utils/extraction';

const ExtractionScreen = () => {
  const route = useRoute();
  const { text } = route.params as { text: string };
  const [extractedData, setExtractedData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const processText = async () => {
      try {
        const result = await extractData(text);
        setExtractedData(result);
      } catch (error) {
        console.error('Extraction failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    processText();
  }, [text]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text>Analyzing your text...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Extracted Data</Text>
      {extractedData?.entities && extractedData.entities.length > 0 ? (
        <View style={styles.entitiesContainer}>
          <Text style={styles.sectionTitle}>Entities Found:</Text>
          {extractedData.entities.map((entity: any, index: number) => (
            <View key={index} style={styles.entityItem}>
              <Text style={styles.entityType}>{entity.type}</Text>
              <Text style={styles.entityValue}>{entity.value}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text>No entities found in the text.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  entitiesContainer: {
    marginTop: 10,
  },
  entityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entityType: {
    fontWeight: 'bold',
    color: '#666',
  },
  entityValue: {
    marginTop: 5,
  },
});

export default ExtractionScreen;
