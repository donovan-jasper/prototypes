import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useStore } from '../../store/useStore';
import WordCard from '../../components/WordCard';
import StreakCounter from '../../components/StreakCounter';
import { getDueWords, updateProgress } from '../../lib/database';
import { calculateNextReview, updateCardState } from '../../lib/fsrs';

export default function DailyPractice() {
  const { incrementStreak } = useStore();
  const [dailyQueue, setDailyQueue] = useState([]);
  const [currentWordIndex, setCurrentWordIndex]
