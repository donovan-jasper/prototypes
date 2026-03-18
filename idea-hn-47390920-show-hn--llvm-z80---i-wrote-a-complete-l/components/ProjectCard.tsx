import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Project } from '@/lib/database/db';
import { COMPILATION_TARGETS, LANGUAGES } from '@/constants/targets';

interface ProjectCardProps {
  project: Project;
  onPress: () => void;
  onDelete: () => void;
}

export default function ProjectCard({ project, onPress, onDelete }: ProjectCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const target = COMPILATION_TARGETS.find((t) => t.id === project.target);
  const language = LANGUAGES.find((l) => l.id === project.language);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <TouchableOpacity
      style={[styles.card, isDark && styles.cardDark]}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="code-slash" size={24} color={isDark ? '#fff' : '#000'} />
        </View>
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
      <Text style={[styles.name, isDark && styles.textDark]}>{project.name}</Text>
      <View style={styles.meta}>
        <View style={styles.metaTag}>
          <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
            {target?.name || project.target.toUpperCase()}
          </Text>
        </View>
        <View style={styles.metaTag}>
          <Text style={[styles.metaText, isDark && styles.metaTextDark]}>
            {language?.name || project.language.toUpperCase()}
          </Text>
        </View>
      </View>
      <Text style={[styles.date, isDark && styles.textSecondaryDark]}>
        Modified {formatDate(project.updated_at)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: '#2a2a2a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    padding: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  textDark: {
    color: '#fff',
  },
  textSecondaryDark: {
    color: '#888',
  },
  meta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  metaTag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  metaTextDark: {
    color: '#aaa',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
