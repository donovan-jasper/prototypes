import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { getAppointmentWithDocuments, deleteAppointment } from '../../lib/appointmentService';
import { Appointment, Document } from '../../types';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { pickDocument, addDocument, attachDocumentToAppointment } from '../../lib/documentService';

export default function AppointmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [appointment, setAppointment] = useState<(Appointment & { documents: Document[] }) | null>(null);
  const [loading, setLoading] = useState(true);

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
      const result = await pickDocument();
      if (result.canceled) return;

      const file = result.assets[0];
      const fileUri = file.uri;

      // Create a new document
      const document = await addDocument(
        appointment!.familyMemberId,
        file.name || 'Document',
        file.mimeType || 'application/octet-stream',
        fileUri
      );

      // Attach to appointment
      await attachDocumentToAppointment(document.id, appointment!.id);

      // Refresh appointment data
      await loadAppointment();
    } catch (error) {
      console.error('Failed to add document:', error);
      Alert.alert('Error', 'Failed to add document');
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
          <TouchableOpacity onPress={handleAddDocument} style={styles.addButton}>
            <Ionicons name="add" size={20} color="#007AFF" />
            <Text style={styles.addButtonText}>Add Document</Text>
          </TouchableOpacity>
        </View>

        {appointment.documents.length > 0 ? (
          <View style={styles.documentsContainer}>
            {appointment.documents.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.documentCard}
                onPress={() => handleViewDocument(doc)}
              >
                <View style={styles.documentIcon}>
                  <Ionicons
                    name={doc.type.includes('pdf') ? 'document-text' : 'image'}
                    size={24}
                    color="#007AFF"
                  />
                </View>
                <View style={styles.documentInfo}>
                  <Text style={styles.documentTitle} numberOfLines={1}>
                    {doc.title}
                  </Text>
                  <Text style={styles.documentDate}>
                    {format(new Date(doc.uploadDate), 'MMM d, yyyy')}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyText}>No documents attached to this appointment</Text>
        )}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
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
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  notes: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  documentsContainer: {
    marginTop: 8,
  },
  documentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    marginBottom: 8,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e6f2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  documentDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
  },
  actions: {
    padding: 20,
  },
  deleteButton: {
    backgroundColor: '#ff3b30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
