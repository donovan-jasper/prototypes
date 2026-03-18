import { View, Text, StyleSheet, FlatList } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const mockActivities = [
  {
    id: '1',
    type: 'commit',
    user: 'Sarah Chen',
    message: 'Updated homepage hero section',
    repo: 'marketing-site',
    time: '2 hours ago',
  },
  {
    id: '2',
    type: 'pr',
    user: 'Mike Johnson',
    message: 'Added new feature flag system',
    repo: 'backend-api',
    time: '4 hours ago',
  },
  {
    id: '3',
    type: 'commit',
    user: 'Emma Davis',
    message: 'Fixed typo in documentation',
    repo: 'docs',
    time: '6 hours ago',
  },
];

export default function ActivityScreen() {
  const getIcon = (type: string) => {
    switch (type) {
      case 'commit':
        return 'source-commit';
      case 'pr':
        return 'source-pull';
      default:
        return 'information';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Activity Feed</Text>
      </View>
      <FlatList
        data={mockActivities}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.activityCard}>
            <MaterialCommunityIcons
              name={getIcon(item.type)}
              size={24}
              color="#2196F3"
              style={styles.icon}
            />
            <View style={styles.activityContent}>
              <Text style={styles.activityUser}>{item.user}</Text>
              <Text style={styles.activityMessage}>{item.message}</Text>
              <View style={styles.activityMeta}>
                <Text style={styles.activityRepo}>{item.repo}</Text>
                <Text style={styles.activityTime}> • {item.time}</Text>
              </View>
            </View>
          </View>
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
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityUser: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  activityMessage: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityRepo: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#9e9e9e',
  },
});
