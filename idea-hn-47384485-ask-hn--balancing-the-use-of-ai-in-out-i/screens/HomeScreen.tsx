import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const HomeScreen = () => {
  const [message, setMessage] = useState('');
  const [authenticityScore, setAuthenticityScore] = useState<number | null>(null);
  const [authenticityStatus, setAuthenticityStatus] = useState('');
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [platform, setPlatform] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [analysisCount, setAnalysisCount] = useState(0);
  const navigation = useNavigation();

  useEffect(() => {
    const initDb = async () => {
      const database = await SQLite.openDatabaseAsync('authentichat.db');
      await database.execAsync(
        'CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, score INTEGER, status TEXT, platform TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);'
      );
      setDb(database);
    };
    initDb();

    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to analyze images!');
        }
      }
    })();
  }, []);

  const analyzeMessage = async () => {
    if (!db) return;

    if (!isPremium && analysisCount >= 10) {
      Alert.alert(
        "Premium Feature",
        "You've reached your daily limit of 10 analyses. Upgrade to premium for unlimited analyses.",
        [
          { text: "Cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate('Settings') }
        ]
      );
      return;
    }

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
    setAnalysisCount(prev => prev + 1);

    await db.runAsync(
      'INSERT INTO messages (text, score, status, platform) VALUES (?, ?, ?, ?);',
      [message, score, status, platform]
    );
  };

  const pasteFromClipboard = async () => {
    const text = await Clipboard.getStringAsync();
    setMessage(text);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      // In a real app, you would send this to your AI service for OCR
      setMessage(`[Image content: ${base64.substring(0, 100)}...]`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>AuthentiChat</Text>
      <Text style={styles.subtitle}>Analyze message authenticity</Text>

      {!isPremium && (
        <View style={styles.limitContainer}>
          <Text style={styles.limitText}>Free tier: {10 - analysisCount} analyses remaining today</Text>
        </View>
      )}

      <View style={styles.platformSelector}>
        <Text style={styles.platformLabel}>Platform:</Text>
        <TextInput
          style={styles.platformInput}
          placeholder="e.g. WhatsApp, Instagram, Email"
          value={platform}
          onChangeText={setPlatform}
        />
      </View>

      <TextInput
        style={styles.input}
        multiline
        placeholder="Paste your message here..."
        value={message}
        onChangeText={setMessage}
      />

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={pasteFromClipboard}>
          <Ionicons name="clipboard-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Paste</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Ionicons name="image-outline" size={20} color="white" />
          <Text style={styles.buttonText}>Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={analyzeMessage}>
          <Ionicons name="analytics-outline" size={20} color="white" />
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
          {platform && (
            <Text style={styles.platformResult}>Platform: {platform}</Text>
          )}
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
  limitContainer: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  limitText: {
    textAlign: 'center',
    color: '#666',
  },
  platformSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  platformLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  platformInput: {
    flex: 1,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginLeft: 5,
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
  platformResult: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: '#666',
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
