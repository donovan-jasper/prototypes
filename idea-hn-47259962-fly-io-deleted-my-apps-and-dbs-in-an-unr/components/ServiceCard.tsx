import { View, Text, StyleSheet, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';

interface ServiceCardProps {
  name: string;
  provider: string;
  status: 'healthy' | 'unhealthy' | 'deleted';
  lastCheck?: number;
  onPress?: () => void;
}

export default function ServiceCard({ name, provider, status, lastCheck, onPress }: ServiceCardProps) {
  const statusColor = status === 'healthy' ? '#10B981' : status === 'unhealthy' ? '#F59E0B' : '#EF4444';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  const lastCheckText = lastCheck
    ? `Last checked ${formatDistanceToNow(lastCheck)} ago`
    : 'Never checked';

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={[styles.indicator, { backgroundColor: statusColor }]} testID="status-indicator" />
      </View>
      <Text style={styles.provider}>{provider}</Text>
      <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      <Text style={styles.lastCheck}>{lastCheckText}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  provider: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  status: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  lastCheck: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
