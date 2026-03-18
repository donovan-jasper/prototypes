import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Tutorial {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  platform: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const tutorials: Tutorial[] = [
  {
    id: '1',
    title: 'Getting Started with C',
    description: 'Learn the basics of C programming and compile your first program',
    difficulty: 'Beginner',
    platform: 'x86',
    icon: 'book-outline',
  },
  {
    id: '2',
    title: 'Arduino Basics',
    description: 'Blink an LED and read sensor data on Arduino',
    difficulty: 'Beginner',
    platform: 'AVR',
    icon: 'flash-outline',
  },
  {
    id: '3',
    title: 'Game Boy Graphics',
    description: 'Draw sprites and backgrounds on the Game Boy',
    difficulty: 'Intermediate',
    platform: 'Game
