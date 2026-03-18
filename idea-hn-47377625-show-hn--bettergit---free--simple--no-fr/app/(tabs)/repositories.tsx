import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRepositoryStore } from '@/stores/useRepositoryStore';

export default function RepositoriesScreen() {
  const router = useRouter();
  const repositories = useRepositoryStore((state) => state.repositories);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Repositories</Text>
      </View>
      <FlatList
        data={repositories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.repoCard}
            onPress={() => router.push(`/repository/${item.id}`)}
            activeOpacity={0.7}
          >
            <View style={styles.repoHeader}>
              <MaterialCommunityIcons
                name="source-repository"
                size={20}
                color="#2196F3"
              />
              <Text style={styles.repoName}>{item.name}</Text>
            </View>
            <Text style={styles.repoDescription}>{item.description}</Text>
            <View style={styles.repoStats}>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="star-outline" size={16} color="#757575" />
                <Text style={styles.statText}>{item.stars}</Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="source-fork" size={16} color="#757575" />
                <Text style={styles.statText}>{item.forks}</Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons name="circle" size={12} color={item.languageColor} />
                <Text style={styles.statText}>{item.language}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  listContent: {
    padding: 16,
  },
  repoCard: {
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
  repoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  repoName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginLeft: 8,
  },
  repoDescription: {
    fontSize: 14,
    color: '#616161',
    marginBottom: 12,
    lineHeight: 20,
  },
  repoStats: {
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
