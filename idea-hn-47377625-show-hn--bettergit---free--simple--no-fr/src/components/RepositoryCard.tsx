import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface RepositoryCardProps {
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  languageColor: string;
  onPress: () => void;
}

export default function RepositoryCard({
  name,
  description,
  stars,
  forks,
  language,
  languageColor,
  onPress,
}: RepositoryCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="source-repository" size={20} color="#2196F3" />
        <Text style={styles.name}>{name}</Text>
      </View>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="star-outline" size={16} color="#757575" />
          <Text style={styles.statText}>{stars}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="source-fork" size={16} color="#757575" />
          <Text style={styles.statText}>{forks}</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="circle" size={12} color={languageColor} />
          <Text style={styles.statText}>{language}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
});
