import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Button } from 'react-native';
import { getDatabase } from '../../services/database';
import { generateCoachingTip } from '../../services/coaching';

export default function CoachingScreen() {
  const [tips, setTips] = useState([]);

  useEffect(() => {
    loadTips();
  }, []);

  async function loadTips() {
    const db = getDatabase();
    const result = await db.getAllAsync('SELECT * FROM coaching_tips ORDER BY created_at DESC LIMIT 10');
    setTips(result);
  }

  async function generateNewTip() {
    const tip = await generateCoachingTip();
    const db = getDatabase();
    await db.runAsync(
      'INSERT INTO coaching_tips (tip, category, created_at) VALUES (?, ?, ?)',
      [tip.tip, tip.category, new Date().toISOString()]
    );
    loadTips();
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Financial Coaching</Text>
      <Button title="Get New Tip" onPress={generateNewTip} />
      
      {tips.map((tip) => (
        <View key={tip.id} style={styles.tipCard}>
          <Text style={styles.tipCategory}>{tip.category}</Text>
          <Text style={styles.tipText}>{tip.tip}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  tipCard: { backgroundColor: 'white', padding: 20, marginBottom: 15, borderRadius: 10 },
  tipCategory: { fontSize: 12, color: '#666', textTransform: 'uppercase', marginBottom: 10 },
  tipText: { fontSize: 16, lineHeight: 24 }
});
