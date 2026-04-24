import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../../firebaseConfig';
import * as SQLite from 'expo-sqlite';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface LearningPath {
  id: string;
  title: string;
  steps: {
    id: string;
    title: string;
    completed: boolean;
  }[];
  progress: number;
}

const LearnScreen = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearningPaths = async () => {
      try {
        // Initialize SQLite database
        const sqliteDb = SQLite.openDatabase('codeshift.db');

        // Create table if it doesn't exist
        sqliteDb.transaction(tx => {
          tx.executeSql(
            'CREATE TABLE IF NOT EXISTS learning_paths (id TEXT PRIMARY KEY, title TEXT, steps TEXT, progress REAL);'
          );
        });

        // First try to get data from SQLite (offline)
        sqliteDb.transaction(tx => {
          tx.executeSql(
            'SELECT * FROM learning_paths',
            [],
            (_, { rows }) => {
              if (rows.length > 0) {
                const paths = rows._array.map((row: any) => ({
                  ...row,
                  steps: JSON.parse(row.steps)
                }));
                setLearningPaths(paths);
                setLoading(false);
              } else {
                // If no data in SQLite, fetch from Firestore
                fetchFromFirestore(sqliteDb);
              }
            },
            (_, error) => {
              console.error('SQLite error:', error);
              fetchFromFirestore(sqliteDb);
            }
          );
        });
      } catch (error) {
        console.error('Error initializing database:', error);
        setLoading(false);
      }
    };

    const fetchFromFirestore = async (sqliteDb: SQLite.SQLiteDatabase) => {
      try {
        const querySnapshot = await getDocs(collection(db, 'learningPaths'));
        const paths: LearningPath[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          paths.push({
            id: doc.id,
            title: data.title,
            steps: data.steps.map((step: any) => ({
              id: step.id,
              title: step.title,
              completed: step.completed || false
            })),
            progress: calculateProgress(data.steps)
          });
        });

        setLearningPaths(paths);
        setLoading(false);

        // Save to SQLite for offline use
        paths.forEach(path => {
          sqliteDb.transaction(tx => {
            tx.executeSql(
              'INSERT OR REPLACE INTO learning_paths (id, title, steps, progress) VALUES (?, ?, ?, ?)',
              [path.id, path.title, JSON.stringify(path.steps), path.progress]
            );
          });
        });
      } catch (error) {
        console.error('Error fetching learning paths:', error);
        setLoading(false);
      }
    };

    fetchLearningPaths();
  }, []);

  const calculateProgress = (steps: any[]) => {
    if (steps.length === 0) return 0;
    const completed = steps.filter(step => step.completed).length;
    return Math.round((completed / steps.length) * 100);
  };

  const toggleStepCompletion = async (pathId: string, stepId: string) => {
    try {
      const updatedPaths = learningPaths.map(path => {
        if (path.id === pathId) {
          const updatedSteps = path.steps.map(step => {
            if (step.id === stepId) {
              return { ...step, completed: !step.completed };
            }
            return step;
          });

          const newProgress = calculateProgress(updatedSteps);

          // Update in SQLite
          const sqliteDb = SQLite.openDatabase('codeshift.db');
          sqliteDb.transaction(tx => {
            tx.executeSql(
              'UPDATE learning_paths SET steps = ?, progress = ? WHERE id = ?',
              [JSON.stringify(updatedSteps), newProgress, pathId]
            );
          });

          // Update in Firestore
          const pathRef = doc(db, 'learningPaths', pathId);
          updateDoc(pathRef, {
            steps: updatedSteps,
            progress: newProgress
          });

          return { ...path, steps: updatedSteps, progress: newProgress };
        }
        return path;
      });

      setLearningPaths(updatedPaths);
    } catch (error) {
      console.error('Error updating step completion:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Learning Paths</Text>
      <FlatList
        data={learningPaths}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.pathContainer}>
            <Text style={styles.pathTitle}>{item.title}</Text>
            <Text style={styles.progressText}>{item.progress}% Complete</Text>
            <View style={styles.stepsContainer}>
              {item.steps.map(step => (
                <TouchableOpacity
                  key={step.id}
                  style={styles.stepItem}
                  onPress={() => toggleStepCompletion(item.id, step.id)}
                >
                  <View style={[
                    styles.checkbox,
                    step.completed && styles.checkboxCompleted
                  ]} />
                  <Text style={[
                    styles.stepText,
                    step.completed && styles.stepTextCompleted
                  ]}>
                    {step.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  pathContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pathTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  stepsContainer: {
    marginTop: 8,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 4,
    marginRight: 12,
  },
  checkboxCompleted: {
    backgroundColor: '#007AFF',
  },
  stepText: {
    fontSize: 16,
    color: '#333',
  },
  stepTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#888',
  },
});

export default LearnScreen;
