import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import * as SQLite from 'expo-sqlite';
import * as Notifications from 'expo-notifications';

const db = SQLite.openDatabase('driftguard.db');

interface WorkSession {
  id: number;
  content: string;
  timestamp: string;
  preview: string;
}

const WorkSessionScreen = () => {
  const [content, setContent] = useState('');
  const [sessions, setSessions] = useState<WorkSession[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);
  const { sleepDetected } = useAppStore();

  useEffect(() => {
    // Initialize work_sessions table
    db.transaction(tx => {
      tx.executeSql(
        `CREATE TABLE IF NOT EXISTS work_sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          content TEXT,
          timestamp TEXT
        );`
      );
    });

    loadSessions();
  }, []);

  useEffect(() => {
    // Auto-save every 30 seconds while typing
    if (autoSaveTimer.current) {
      clearTimeout(autoSaveTimer.current);
    }

    if (content.trim()) {
      autoSaveTimer.current = setTimeout(() => {
        saveSession(false);
      }, 30000);
    }

    return () => {
      if (autoSaveTimer.current) {
        clearTimeout(autoSaveTimer.current);
      }
    };
  }, [content]);

  useEffect(() => {
    // Immediate save when sleep detected
    if (sleepDetected && content.trim()) {
      saveSession(true);
    }
  }, [sleepDetected]);

  const loadSessions = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM work_sessions ORDER BY timestamp DESC LIMIT 20',
        [],
        (_, { rows: { _array } }) => {
          const formattedSessions = _array.map(session => ({
            ...session,
            preview: session.content.substring(0, 100) + (session.content.length > 100 ? '...' : '')
          }));
          setSessions(formattedSessions);
        }
      );
    });
  };

  const saveSession = async (fromSleepDetection: boolean) => {
    if (!content.trim()) return;

    const timestamp = new Date().toISOString();

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO work_sessions (content, timestamp) VALUES (?, ?)',
        [content, timestamp],
        () => {
          setLastSaved(new Date());
          loadSessions();

          if (fromSleepDetection) {
            Notifications.scheduleNotificationAsync({
              content: {
                title: '💾 Work Saved',
                body: 'Sleep detected—your work is safe',
                sound: true,
              },
              trigger: null,
            });
          }
        }
      );
    });
  };

  const deleteSession = (id: number) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM work_sessions WHERE id = ?',
                [id],
                () => loadSessions()
              );
            });
          }
        }
      ]
    );
  };

  const loadSession = (session: WorkSession) => {
    setContent(session.content);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const renderSession = ({ item }: { item: WorkSession }) => (
    <TouchableOpacity 
      style={styles.sessionCard}
      onPress={() => loadSession(item)}
      onLongPress={() => deleteSession(item.id)}
    >
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionTime}>{formatTimestamp(item.timestamp)}</Text>
        <Text style={styles.sessionLength}>{item.content.length} chars</Text>
      </View>
      <Text style={styles.sessionPreview}>{item.preview}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.editorSection}>
        <View style={styles.header}>
          <Text style={styles.title}>Work Session</Text>
          {lastSaved && (
            <Text style={styles.savedIndicator}>
              Saved {formatTimestamp(lastSaved.toISOString())}
            </Text>
          )}
        </View>
        
        <TextInput
          style={styles.textInput}
          multiline
          placeholder="Start typing your work here... Auto-saves every 30 seconds"
          value={content}
          onChangeText={setContent}
          textAlignVertical="top"
        />

        <TouchableOpacity 
          style={styles.saveButton}
          onPress={() => saveSession(false)}
        >
          <Text style={styles.saveButtonText}>Save Now</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sessionsSection}>
        <Text style={styles.sessionsTitle}>Saved Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No saved sessions yet</Text>
        ) : (
          <FlatList
            data={sessions}
            renderItem={renderSession}
            keyExtractor={item => item.id.toString()}
            contentContainerStyle={styles.sessionsList}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  editorSection: {
    flex: 1,
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  savedIndicator: {
    fontSize: 12,
    color: '#4CAF50',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    padding: 12,
    backgroundColor: '#fafafa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sessionsSection: {
    flex: 1,
    padding: 16,
  },
  sessionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  sessionsList: {
    paddingBottom: 16,
  },
  sessionCard: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sessionTime: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  sessionLength: {
    fontSize: 12,
    color: '#999',
  },
  sessionPreview: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default WorkSessionScreen;
