import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRepositoryStore } from '@/stores/useRepositoryStore';

export default function RepositoryDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const repository = useRepositoryStore((state) =>
    state.repositories.find((r) => r.id === id)
  );

  if (!repository) {
    return (
      <View style={styles.container}>
        <Text>Repository not found</Text>
      </View>
    );
  }

  const mockFiles = [
    { id: '1', name: 'src', type: 'folder', children: 3 },
    { id: '2', name: 'components', type: 'folder', children: 8 },
    { id: '3', name: 'README.md', type: 'file', size: '2.4 KB' },
    { id: '4', name: 'package.json', type: 'file', size: '1.2 KB' },
    { id: '5', name: 'tsconfig.json', type: 'file', size: '856 B' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#212121" />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {repository.name}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.description}>{repository.description}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="star-outline" size={20} color="#757575" />
              <Text style={styles.statValue}>{repository.stars}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="source-fork" size={20} color="#757575" />
              <Text style={styles.statValue}>{repository.forks}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="circle"
                size={16}
                color={repository.languageColor}
              />
              <Text style={styles.statValue}>{repository.language}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Files</Text>
          {mockFiles.map((file) => (
            <TouchableOpacity
              key={file.id}
              style={styles.fileItem}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={file.type === 'folder' ? 'folder' : 'file-document-outline'}
                size={24}
                color={file.type === 'folder' ? '#FFA726' : '#757575'}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileName}>{file.name}</Text>
                <Text style={styles.fileDetail}>
                  {file.type === 'folder'
                    ? `${file.children} items`
                    : file.size}
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#bdbdbd"
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statValue: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 6,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    padding: 16,
    paddingBottom: 8,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 15,
    color: '#212121',
    fontWeight: '500',
    marginBottom: 2,
  },
  fileDetail: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});
