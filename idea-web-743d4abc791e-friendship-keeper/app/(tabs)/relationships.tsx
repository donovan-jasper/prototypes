import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, TouchableOpacity, Text, RefreshControl } from 'react-native';
import { RelationshipCard } from '../../components/RelationshipCard';
import { getRelationships } from '../../services/relationshipService';
import { RelationshipWithHealth } from '../../types';
import { useRouter, useFocusEffect } from 'expo-router';

export default function RelationshipsScreen() {
  const router = useRouter();
  const [relationships, setRelationships] = useState<RelationshipWithHealth[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Family', 'Friends', 'Professional', 'Acquaintance'];

  const load
