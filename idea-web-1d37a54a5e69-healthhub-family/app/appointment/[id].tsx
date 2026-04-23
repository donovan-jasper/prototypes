import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAppointmentWithDocuments, deleteAppointment } from '../../lib/appointmentService';
import { Appointment, Document } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { pickDocument, addDocument, attachDocumentToAppointment, getDocumentsByMember } from '../../lib/documentService';
import { usePremium } from '../../hooks/usePremium';
import DocumentCard from '../../components/DocumentCard';

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
        <Text>Loading...</Text>
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
        <Text style={styles.provider}>{appointment.provider}</Text>
        <Text style={styles.date}>{format(new Date(appointment.date), 'MMMM d, yyyy h:mm a')}</Text>
        {appointment.location && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={16} color="#666" />
            <Text style={styles.location}>{appointment.location}</Text>
          </View>
        )}
      </View>

      {appointment.notes && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{appointment.notes}</Text>
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Documents</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleAddDocument} style={styles.actionButton}>
              <Ionicons name="camera" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                loadVaultDocuments();
                setShowVault(true);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="folder-open" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Attach from Vault</Text>
            </TouchableOpacity>
          </View>
        </View>

        {appointment.documents.length > 0 ? (
          <View style={styles.documentsContainer}>
            {appointment.documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onPress={() => handleViewDocument(doc)}
                onDelete={() => handleDeleteDocument(doc.id)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color="#ccc" />
            <Text style={styles.emptyText}>No documents attached</Text>
            <Text style={styles.emptySubtext}>Add documents to keep track of your appointment records</Text>
          </View>
        )}
      </View>

      {showVault && (
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Document from Vault</Text>
            <TouchableOpacity onPress={() => setShowVault(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={vaultDocuments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.vaultItem}
                onPress={() => handleAttachVaultDocument(item)}
              >
                <View style={styles.vaultItemIcon}>
                  {item.type.includes('image') ? (
                    <Ionicons name="image-outline" size={24} color="#007AFF" />
                  ) : (
                    <Ionicons name="document-outline" size={24} color="#007AFF" />
                  )}
                </View>
                <View style={styles.vaultItemContent}>
                  <Text style={styles.vaultItemTitle}>{item.title}</Text>
                  <Text style={styles.vaultItemDate}>{format(new Date(item.uploadDate), 'MMM d, yyyy')}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyVault}>
                <Ionicons name="folder-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No documents in vault</Text>
                <Text style={styles.emptySubtext}>Add documents to your vault first</Text>
              </View>
            }
          />
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteButtonText}>Delete Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  provider: {
    fontSize: 18,
    color: '#666',
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: '#444',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  location: {
    fontSize: 16,
    color: '#444',
    marginLeft: 8,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  actionButtonText: {
    color: '#007AFF',
    marginLeft: 4,
    fontSize: 14,
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  documentsContainer: {
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  vaultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  vaultItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vaultItemContent: {
    flex: 1,
  },
  vaultItemTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  vaultItemDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyVault: {
    alignItems: 'center',
    padding: 32,
  },
  footer: {
    padding: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  deleteButtonText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
});
