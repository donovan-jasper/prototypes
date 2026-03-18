import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ticket } from '../lib/types';

interface TicketCardProps {
  ticket: Ticket;
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const router = useRouter();
  
  const getStatusInfo = () => {
    const now = new Date();
    const deadline = new Date(
      ticket.submittedAt.getTime() + ticket.expectedResponseHours * 60 * 60 * 1000
    );
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining < 0) {
      return {
        color: '#FF3B30',
        text: 'Overdue',
        backgroundColor: '#FFE5E5',
      };
    } else if (hoursRemaining < 24) {
      return {
        color: '#FF9500',
        text: 'Due Soon',
        backgroundColor: '#FFF4E5',
      };
    } else {
      return {
        color: '#34C759',
        text: 'On Track',
        backgroundColor: '#E5F8E8',
      };
    }
  };

  const statusInfo = getStatusInfo();

  const handlePress = () => {
    router.push(`/ticket/${ticket.id}`);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.header}>
        <Text style={styles.company}>{ticket.company}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: statusInfo.backgroundColor },
          ]}
        >
          <Text style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </Text>
        </View>
      </View>
      <Text style={styles.ticketId}>{ticket.ticketId}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {ticket.description}
      </Text>
      <Text style={styles.date}>
        Submitted {ticket.submittedAt.toLocaleDateString()}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
  company: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#3C3C43',
    marginBottom: 8,
    lineHeight: 20,
  },
  date: {
    fontSize: 12,
    color: '#8E8E93',
  },
});
