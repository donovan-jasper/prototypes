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
          <Text style={styles.location}>{appointment.location}</Text>
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
          <Text style={styles.sectionTitle}>Attached Documents</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleAddDocument} style={styles.actionButton}>
              <Ionicons name="add" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>Add New</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={loadVaultDocuments} style={styles.actionButton}>
              <Ionicons name="folder-open" size={20} color={Colors.primary} />
              <Text style={styles.actionButtonText}>From Vault</Text>
            </TouchableOpacity>
          </View>
        </View>

        {appointment.documents.length > 0 ? (
          <FlatList
            data={appointment.documents}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <DocumentCard
                document={item}
                onView={handleViewDocument}
                onDelete={handleDeleteDocument}
              />
            )}
            scrollEnabled={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={48} color={Colors.gray} />
            <Text style={styles.emptyText}>No documents attached</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => router.push(`/appointment/edit/${appointment.id}`)} style={styles.editButton}>
          <Ionicons name="pencil" size={20} color={Colors.primary} />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="trash" size={20} color={Colors.error} />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showVault}
        animationType="slide"
        onRequestClose={() => setShowVault(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select from Vault</Text>
            <TouchableOpacity onPress={() => setShowVault(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {vaultDocuments.length > 0 ? (
            <FlatList
              data={vaultDocuments}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.vaultItem}
                  onPress={() => handleAttachVaultDocument(item)}
                >
                  <DocumentCard document={item} />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="folder-outline" size={48} color={Colors.gray} />
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
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  provider: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  date: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  location: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    color: Colors.text,
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
    color: Colors.primary,
    marginLeft: 4,
  },
  notes: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    color: Colors.gray,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.primaryLight,
  },
  editButtonText: {
    color: Colors.primary,
    marginLeft: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: Colors.errorLight,
  },
  deleteButtonText: {
    color: Colors.error,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  vaultItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
});
