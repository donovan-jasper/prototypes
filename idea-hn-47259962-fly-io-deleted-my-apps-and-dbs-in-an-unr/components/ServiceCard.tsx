import { View, Text, StyleSheet, Pressable } from 'react-native';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'expo-router';

interface ServiceCardProps {
  id: string;
  name: string;
  provider: string;
  status: 'healthy' | 'unhealthy' | 'deleted';
  lastCheck?: number;
}

export default function ServiceCard({ id, name, provider, status, lastCheck }: ServiceCardProps) {
  const statusColor = status === 'healthy' ? '#10B981' : status === 'unhealthy' ? '#F59E0B' : '#EF4444';
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);
  const router = useRouter();

  const lastCheckText = lastCheck
    ? `Last checked ${formatDistanceToNow(lastCheck)} ago`
    : 'Never checked';

  function handlePress() {
    if (status !== 'healthy') {
      router.push({
        pathname: '/(tabs)/recovery',
        params: { serviceId: id }
      });
    }
  }

  return (
    <Pressable
      style={styles.card}
      onPress={handlePress}
      disabled={status === 'healthy'}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{name}</Text>
        <View style={[styles.indicator, { backgroundColor: statusColor }]} testID="status-indicator" />
      </View>
      <Text style={styles.provider}>{provider}</Text>
      <Text style={[styles.status, { color: statusColor }]}>{statusText}</Text>
      <Text style={styles.lastCheck}>{lastCheckText}</Text>
      {status !== 'healthy' && (
        <View style={styles.recoveryButton}>
          <Text style={styles.recoveryButtonText}>View Recovery Options</Text>
        </View>
      )}
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
  recoveryButton: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    alignItems: 'center',
  },
  recoveryButtonText: {
    color: '#3B82F6',
    fontSize: 14,
    fontWeight: '500',
  },
});
