import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform, FlatList, Modal } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAppointmentWithDocuments, deleteAppointment } from '../../lib/appointmentService';
import { Appointment, Document } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { pickDocument, addDocument, attachDocumentToAppointment, getDocumentsByMember, deleteDocument } from '../../lib/documentService';
import { usePremium } from '../../hooks/usePremium';
import DocumentCard from '../../components/DocumentCard';
import Colors from '../../constants/Colors';

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<(Appointment & { documents: Document[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaultDocuments, setVaultDocuments] = useState<Document[]>([]);
  const [showVault, setShowVault] = useState(false);
  const { isPremium, checkDocumentLimit } = usePremium();

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const loadAppointment = async () => {
    try {
      const data = await getAppointmentWithDocuments(Number(id));
      setAppointment(data);
    } catch (error) {
      console.error('Failed to load appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVaultDocuments = async () => {
    if (!appointment) return;
    try {
      const documents = await getDocumentsByMember(appointment.familyMemberId);
      setVaultDocuments(documents.filter(doc => !doc.appointmentId));
      setShowVault(true);
    } catch (error) {
      console.error('Failed to load vault documents:', error);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAppointment(Number(id));
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete appointment');
            }
          },
        },
      ]
    );
  };

  const handleAddDocument = async () => {
    try {
      const canAdd = await checkDocumentLimit(appointment?.documents.length || 0);
      if (!canAdd && !isPremium) {
        Alert.alert(
          'Document Limit Reached',
          'Free users can only attach up to 50 documents. Upgrade to premium for unlimited documents.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/settings') }
          ]
        );
        return;
      }

      const result = await pickDocument();
      if (result.canceled) return;

      const file = result.assets[0];
      const fileUri = file.uri;

      // Create a new document
      const document = await addDocument(
        appointment!.familyMemberId,
        file.name || 'Document',
        file.mimeType || 'application/octet-stream',
        fileUri,
        appointment!.id
      );

      // Refresh appointment data
      await loadAppointment();
    } catch (error) {
      console.error('Failed to add document:', error);
      Alert.alert('Error', 'Failed to add document');
    }
  };

  const handleAttachVaultDocument = async (document: Document) => {
    try {
      await attachDocumentToAppointment(document.id, appointment!.id);
      await loadAppointment();
      setShowVault(false);
    } catch (error) {
      console.error('Failed to attach document:', error);
      Alert.alert('Error', 'Failed to attach document');
    }
  };

  const handleViewDocument = async (document: Document) => {
    try {
      if (Platform.OS === 'ios') {
        // On iOS, we can use the document viewer
        await Sharing.shareAsync(document.fileUri, {
          mimeType: document.type,
          dialogTitle: document.title,
        });
      } else {
        // On Android, we need to copy the file to a shareable location
        const fileName = document.fileUri.split('/').pop() || 'document';
        const newPath = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.copyAsync({
          from: document.fileUri,
          to: newPath,
        });
        await Sharing.shareAsync(newPath, {
          mimeType: document.type,
          dialogTitle: document.title,
        });
      }
    } catch (error) {
      console.error('Failed to view document:', error);
      Alert.alert('Error', 'Failed to open document');
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDocument(documentId);
              await loadAppointment();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading appointment details...</Text>
      </View>
    );
  }

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Appointment not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{appointment.type}</Text>
        <Text style={styles.subtitle}>{appointment.provider}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={20} color={Colors.light.tint} />
          <Text style={styles.date}>
            {format(new Date(appointment.date), 'MMMM d, yyyy h:mm a')}
          </Text>
        </View>

        {appointment.location && (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.text}>{appointment.location}</Text>
          </View>
        )}

        {appointment.notes && (
          <View style={styles.row}>
            <Ionicons name="document-text-outline" size={20} color={Colors.light.tint} />
            <Text style={styles.text}>{appointment.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Attached Documents</Text>
          <TouchableOpacity onPress={handleAddDocument} style={styles.addButton}>
            <Ionicons name="add" size={24} color={Colors.light.tint} />
          </TouchableOpacity>
        </View>

        {appointment.documents.length > 0 ? (
          <FlatList
            data={appointment.documents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <DocumentCard
                document={item}
                onPress={() => handleViewDocument(item)}
                onDelete={() => handleDeleteDocument(item.id)}
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No documents attached</Text>
            <TouchableOpacity onPress={handleAddDocument} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Add Document</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity onPress={loadVaultDocuments} style={styles.vaultButton}>
          <Text style={styles.vaultButtonText}>Attach from Vault</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push(`/appointment/add?id=${appointment.id}`)} style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={[styles.actionButton, styles.deleteButton]}>
          <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showVault} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Document Vault</Text>
            <TouchableOpacity onPress={() => setShowVault(false)}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          {vaultDocuments.length > 0 ? (
            <FlatList
              data={vaultDocuments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <DocumentCard
                  document={item}
                  onPress={() => handleAttachVaultDocument(item)}
                  showAttachButton
                />
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No documents in vault</Text>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.light.textSecondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
  },
  text: {
    fontSize: 16,
    color: Colors.light.text,
    marginLeft: 12,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  vaultButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  vaultButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  actionButton: {
    flex: 1,
    padding: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.light.danger,
  },
  deleteButtonText: {
    color: 'white',
  },
  addButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.text,
  },
});
