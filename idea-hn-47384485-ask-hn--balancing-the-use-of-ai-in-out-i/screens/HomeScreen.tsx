import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as SQLite from 'expo-sqlite';

const HomeScreen = () => {
  const [message, setMessage] = useState('');
  const [authenticityScore, setAuthenticityScore] = useState<number | null>(null);
  const [authenticityStatus, setAuthenticityStatus] = useState('');
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);

  useEffect(() => {
    const initDb = async () => {
      const database = await SQLite.openDatabaseAsync('authentichat.db');
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, score INTEGER, status TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
      setDb(database);
    };
    initDb();
  }, []);

  const analyzeMessage = async () => {
    if (!db) return;

    const score = Math.floor(Math.random() * 100) + 1;
    let status = '';

    if (score >= 70) {
      status = 'Human';
    } else if (score >= 40) {
      status = 'Mixed';
    } else {
      status = 'AI';
    }

    setAuthenticityScore(score);
    setAuthenticityStatus(status);

    await db.runAsync(
      'INSERT INTO messages (text, score, status) VALUES (?, ?, ?);',
      [message, score, status]
    );
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setMessage(text);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AuthentiChat</Text>
      <Text style={styles.subtitle}>Analyze message authenticity</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Paste your message here..."
        value={message}
        onChangeText={setMessage}
      />
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pasteFromClipboard}>
          <Text style={styles.buttonText}>Paste</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={analyzeMessage}>
          <Text style={styles.buttonText}>Analyze</Text>
        </TouchableOpacity>
      </View>
      {authenticityScore !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Authenticity Score</Text>
          <Text style={styles.resultScore}>{authenticityScore}</Text>
          <Text style={[
            styles.resultStatus,
            authenticityStatus === 'Human' ? styles.human :
            authenticityStatus === 'Mixed' ? styles.mixed : styles.ai
          ]}>
            {authenticityStatus}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  input: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: 'tomato',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 20,
    borderRadius: 5,
    backgroundColor: '#f5f5f5',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  resultScore: {
    fontSize: 48,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultStatus: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  human: {
    color: 'green',
  },
  mixed: {
    color: 'orange',
  },
  ai: {
    color: 'red',
  },
});

export default HomeScreen;
