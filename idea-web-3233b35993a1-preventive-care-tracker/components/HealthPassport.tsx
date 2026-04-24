import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { getVaccinations, getPrescriptions, getAllergies, getInsurance, addVaccination, addPrescription, addAllergy, addInsurance, deleteVaccination, deletePrescription, deleteAllergy, deleteInsurance } from '../lib/database';

type RecordType = 'vaccinations' | 'prescriptions' | 'allergies' | 'insurance';

interface Record {
  id: string;
  name: string;
  date?: string;
  dosage?: string;
  severity?: string;
  provider?: string;
  policyNumber?: string;
  expirationDate?: string;
}

export default function HealthPassport({ memberId }: { memberId: string }) {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<RecordType>('vaccinations');
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    loadRecords();
  }, [activeTab, memberId]);

  const loadRecords = async () => {
    try {
      let data: Record[] = [];
      switch (activeTab) {
        case 'vaccinations':
          data = await getVaccinations(memberId);
          break;
        case 'prescriptions':
          data = await getPrescriptions(memberId);
          break;
        case 'allergies':
          data = await getAllergies(memberId);
          break;
        case 'insurance':
          data = await getInsurance(memberId);
          break;
      }
      setRecords(data);
    } catch (error) {
      console.error('Error loading records:', error);
      Alert.alert('Error', 'Failed to load records. Please try again.');
    }
  };

  const handleAddRecord = () => {
    navigation.navigate('add-record', {
      memberId,
      recordType: activeTab,
      onSave: loadRecords
    });
  };

  const handleDeleteRecord = async (recordId: string) => {
    try {
      Alert.alert(
        'Delete Record',
        'Are you sure you want to delete this record?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              try {
                switch (activeTab) {
                  case 'vaccinations':
                    await deleteVaccination(recordId);
                    break;
                  case 'prescriptions':
                    await deletePrescription(recordId);
                    break;
                  case 'allergies':
                    await deleteAllergy(recordId);
                    break;
                  case 'insurance':
                    await deleteInsurance(recordId);
                    break;
                }
                loadRecords();
              } catch (error) {
                console.error('Error deleting record:', error);
                Alert.alert('Error', 'Failed to delete record. Please try again.');
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error('Error showing delete confirmation:', error);
    }
  };

  const renderRecordItem = (record: Record) => {
    switch (activeTab) {
      case 'vaccinations':
        return (
          <View style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteRecord(record.id)}>
                <MaterialIcons name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.recordDetail}>Date: {record.date || 'N/A'}</Text>
            <Text style={styles.recordDetail}>Provider: {record.provider || 'N/A'}</Text>
          </View>
        );
      case 'prescriptions':
        return (
          <View style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteRecord(record.id)}>
                <MaterialIcons name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.recordDetail}>Dosage: {record.dosage || 'N/A'}</Text>
            <Text style={styles.recordDetail}>Date: {record.date || 'N/A'}</Text>
          </View>
        );
      case 'allergies':
        return (
          <View style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteRecord(record.id)}>
                <MaterialIcons name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.recordDetail}>Severity: {record.severity || 'N/A'}</Text>
          </View>
        );
      case 'insurance':
        return (
          <View style={styles.recordItem}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordTitle}>{record.name}</Text>
              <TouchableOpacity onPress={() => handleDeleteRecord(record.id)}>
                <MaterialIcons name="delete" size={20} color="#ff4444" />
              </TouchableOpacity>
            </View>
            <Text style={styles.recordDetail}>Policy Number: {record.policyNumber || 'N/A'}</Text>
            <Text style={styles.recordDetail}>Expiration: {record.expirationDate || 'N/A'}</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {(['vaccinations', 'prescriptions', 'allergies', 'insurance'] as RecordType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.recordsContainer}>
        {records.length > 0 ? (
          records.map((record) => (
            <TouchableOpacity
              key={record.id}
              onPress={() => navigation.navigate('edit-record', {
                memberId,
                recordType: activeTab,
                recordId: record.id,
                onSave: loadRecords
              })}
            >
              {renderRecordItem(record)}
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No {activeTab} records found</Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.addButton} onPress={handleAddRecord}>
        <MaterialIcons name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTab: {
    backgroundColor: '#4CAF50',
  },
  tabText: {
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  recordsContainer: {
    flex: 1,
    padding: 16,
  },
  recordItem: {
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
    alignItems: 'center',
    marginBottom: 8,
  },
  recordTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  recordDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
