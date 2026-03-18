import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Clipboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTicketById, updateTicket, deleteTicket } from '../../lib/database';
import { generateFollowUp } from '../../lib/followUpGenerator';
import { Ticket } from '../../lib/types';

export default function TicketDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [followUpModalVisible, setFollowUpModalVisible] = useState(false);
  const [followUpMessage, setFollowUpMessage] = useState('');

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    try {
      const ticketData = await getTicketById(Number(id));
      if (ticketData) {
        setTicket(ticketData);
        setNotes(ticketData.notes || '');
      }
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!ticket) return;
    
    try {
      await updateTicket(ticket.id, { notes });
      Alert.alert('Success', 'Notes saved');
    } catch (error) {
      console.error('Failed to save notes:', error);
      Alert.alert('Error', 'Failed to save notes');
    }
  };

  const handleMarkResolved = async () => {
    if (!ticket) return;
    
    Alert.alert(
      'Mark as Resolved',
      'Are you sure this ticket has been resolved?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Resolved',
          onPress: async () => {
            try {
              await updateTicket(ticket.id, {
                status: 'resolved',
                resolvedAt: new Date(),
              });
              router.back();
            } catch (error) {
              console.error('Failed to mark resolved:', error);
              Alert.alert('Error', 'Failed to update ticket');
            }
          },
        },
      ]
    );
  };

  const handleGenerateFollowUp = () => {
    if (!ticket) return;
    
    const now = new Date();
    const deadline = new Date(
      ticket.submittedAt.getTime() + ticket.expectedResponseHours * 60 * 60 * 1000
    );
    const daysOverdue = Math.ceil((now.getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
    
    const message = generateFollowUp({
      company: ticket.company,
      ticketId: ticket.ticketId,
      daysOverdue: Math.max(1, daysOverdue),
    });
    
    setFollowUpMessage(message);
    setFollowUpModalVisible(true);
  };

  const handleCopyFollowUp = () => {
    Clipboard.setString(followUpMessage);
    Alert.alert('Copied', 'Follow-up message copied to clipboard');
    setFollowUpModalVisible(false);
  };

  const handleDelete = () => {
    if (!ticket) return;
    
    Alert.alert(
      'Delete Ticket',
      'Are you sure you want to delete this ticket? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTicket(ticket.id);
              router.back();
            } catch (error) {
              console.error('Failed to delete ticket:', error);
              Alert.alert('Error', 'Failed to delete ticket');
            }
          },
        },
      ]
    );
  };

  const getStatusInfo = () => {
    if (!ticket) return { color: '#8E8E93', text: 'Unknown', backgroundColor: '#F2F2F7' };
    
    if (ticket.status === 'resolved') {
      return {
        color: '#34C759',
        text: 'Resolved',
        backgroundColor: '#E5F8E8',
      };
    }
    
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

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!ticket) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Ticket not found</Text>
      </View>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{ticket.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Expected Response Time</Text>
          <Text style={styles.infoText}>
            {ticket.expectedResponseHours} hours
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Timeline</Text>
          <View style={styles.timelineItem}>
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Submitted</Text>
              <Text style={styles.timelineDate}>
                {ticket.submittedAt.toLocaleDateString()} at{' '}
                {ticket.submittedAt.toLocaleTimeString()}
              </Text>
            </View>
          </View>
          {ticket.resolvedAt && (
            <View style={styles.timelineItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Resolved</Text>
                <Text style={styles.timelineDate}>
                  {ticket.resolvedAt.toLocaleDateString()} at{' '}
                  {ticket.resolvedAt.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add your notes here..."
            placeholderTextColor="#C7C7CC"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <TouchableOpacity style={styles.saveNotesButton} onPress={handleSaveNotes}>
            <Text style={styles.saveNotesButtonText}>Save Notes</Text>
          </TouchableOpacity>
        </View>

        {ticket.status !== 'resolved' && (
          <View style={styles.actionsSection}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleMarkResolved}
            >
              <Ionicons name="checkmark-circle-outline" size={24} color="#34C759" />
              <Text style={[styles.actionButtonText, { color: '#34C759' }]}>
                Mark Resolved
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleGenerateFollowUp}
            >
              <Ionicons name="mail-outline" size={24} color="#007AFF" />
              <Text style={[styles.actionButtonText, { color: '#007AFF' }]}>
                Generate Follow-up
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={24} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Ticket</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={followUpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setFollowUpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Follow-up Message</Text>
              <TouchableOpacity
                onPress={() => setFollowUpModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.followUpText}>{followUpMessage}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyFollowUp}
            >
              <Ionicons name="copy-outline" size={20} color="#FFFFFF" />
              <Text style={styles.copyButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 100,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginTop: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  company: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  ticketId: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  infoText: {
    fontSize: 16,
    color: '#3C3C43',
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  timelineContent: {
    marginLeft: 12,
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000',
    minHeight: 120,
    marginBottom: 12,
  },
  saveNotesButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveNotesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  actionsSection: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 8,
    padding: 16,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  followUpText: {
    fontSize: 16,
    color: '#3C3C43',
    lineHeight: 24,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
