import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as SQLite from 'expo-sqlite';

const Reader = ({ route }: any) => {
  const { contentId } = route.params;
  const [content, setContent] = useState<any>(null);
  const [fontSize, setFontSize] = useState(16);
  const [fontFamily, setFontFamily] = useState('System');
  const navigation = useNavigation();

  useEffect(() => {
    const loadContent = async () => {
      const db = await SQLite.openDatabaseAsync('pageturner.db');
      const result = await db.getFirstAsync(
        'SELECT * FROM content WHERE id = ?;',
        [contentId]
      );
      setContent(result);
    };
    loadContent();
  }, [contentId]);

  if (!content) {
    return <View style={styles.container}><Text>Loading...</Text></View>;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={[styles.text, { fontSize, fontFamily }]}>{content.text}</Text>
      </ScrollView>
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => setFontSize(Math.max(12, fontSize - 2))}>
          <Text style={styles.controlText}>A-</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontSize(Math.min(32, fontSize + 2))}>
          <Text style={styles.controlText}>A+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontFamily('System')}>
          <Text style={styles.controlText}>System</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setFontFamily('monospace')}>
          <Text style={styles.controlText}>Mono</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
  },
  text: {
    lineHeight: 24,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  controlText: {
    fontSize: 18,
  },
});

export default Reader;
