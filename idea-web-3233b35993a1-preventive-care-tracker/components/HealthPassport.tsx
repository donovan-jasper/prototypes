import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Button } from 'react-native';
import { HealthPassportRecord } from '../types';
import { getHealthPassportRecords, addHealthPassportRecord, updateHealthPassportRecord, deleteHealthPassportRecord } from '../lib/database';

interface HealthPassportProps {
  memberId: string;
}

const HealthPassport: React.FC<HealthPassportProps> = ({ memberId }) => {
  const [records, setRecords] = useState<HealthPassportRecord[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<HealthPassportRecord | null>(null);
  const [formData, setFormData] = useState({
    type: 'vaccination',
    name: '',
    details: '',
    date: '',
    expirationDate: '',
    notes: ''
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    const data = await getHealthPassportRecords(memberId);
    setRecords(data);
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setFormData({
      type: 'vaccination',
      name: '',
      details: '',
      date: '',
      expirationDate: '',
      notes: ''
    });
    setModalVisible(true);
  };

  const handleEditRecord = (record: HealthPassportRecord) => {
    setEditingRecord(record);
    setFormData({
      type: record.type,
      name: record.name,
      details: record.details,
      date: record.date,
      expirationDate: record.expirationDate || '',
      notes: record.notes || ''
    });
    setModalVisible(true);
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteHealthPassportRecord(id);
    loadRecords();
  };

  const handleSaveRecord = async () => {
    if (editingRecord) {
      await updateHealthPassportRecord({
        ...editingRecord,
        ...formData
      });
    } else {
      await addHealthPassportRecord({
        memberId,
        ...formData
      });
    }
    setModalVisible(false);
    loadRecords();
  };

  const renderRecord = ({ item }: { item: HealthPassportRecord }) => (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <Text style={styles.recordType}>{item.type}</Text>
        <Text style={styles.recordDate}>{item.date}</Text>
      </View>
      <Text style={styles.recordName}>{item.name}</Text>
      <Text style={styles.recordDetails}>{item.details}</Text>
      {item.expirationDate && (
        <Text style={styles.recordExpiration}>Expires: {item.expirationDate}</Text>
      )}
      {item.notes && (
        <Text style={styles.recordNotes}>Notes: {item.notes}</Text>
      )}
      <View style={styles.recordActions}>
        <TouchableOpacity onPress={() => handleEditRecord(item)}>
          <Text style={styles.editButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteRecord(item.id)}>
          <Text style={styles.deleteButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Passport</Text>
        <TouchableOpacity onPress={handleAddRecord} style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Record</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={records}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingRecord ? 'Edit Record' : 'Add New Record'}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Type</Text>
              <View style={styles.radioGroup}>
                {['vaccination', 'prescription', 'allergy', 'insurance'].map(type => (
                  <TouchableOpacity
                    key={type}
                    style={styles.radioOption}
                    onPress={() => setFormData({ ...formData, type })}
                  >
                    <View style={[
                      styles.radioCircle,
                      formData.type === type && styles.radioCircleSelected
                    ]} />
                    <Text style={styles.radioLabel}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Details</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.details}
                onChangeText={text => setFormData({ ...formData, details: text })}
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date</Text>
              <TextInput
                style={styles.input}
                value={formData.date}
                onChangeText={text => setFormData({ ...formData, date: text })}
                placeholder="YYYY-MM-DD"
              />
            </View>

            {formData.type !== 'allergy' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Expiration Date</Text>
                <TextInput
                  style={styles.input}
                  value={formData.expirationDate}
                  onChangeText={text => setFormData({ ...formData, expirationDate: text })}
                  placeholder="YYYY-MM-DD (optional)"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={formData.notes}
                onChangeText={text => setFormData({ ...formData, notes: text })}
                multiline
              />
            </View>

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#666" />
              <Button title="Save" onPress={handleSaveRecord} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  recordCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  recordType: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  recordDate: {
    fontSize: 14,
    color: '#666',
  },
  recordName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recordDetails: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  recordExpiration: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  recordNotes: {
    fontSize: 12,
    color: '#555',
    marginBottom: 8,
  },
  recordActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    color: '#2196F3',
    marginLeft: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    color: '#F44336',
    marginLeft: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  radioGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#ccc',
    marginRight: 8,
  },
  radioCircleSelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  radioLabel: {
    fontSize: 16,
    textTransform: 'capitalize',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
});

export default HealthPassport;
