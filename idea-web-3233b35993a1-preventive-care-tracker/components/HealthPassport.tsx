import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, Modal, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Vaccination, Prescription, Allergy, Insurance } from '../types';
import { getVaccinations, getPrescriptions, getAllergies, getInsurance, addVaccination, addPrescription, addAllergy, addInsurance } from '../lib/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { format } from 'date-fns';

interface HealthPassportProps {
  memberId: string;
}

export default function HealthPassport({ memberId }: HealthPassportProps) {
  const navigation = useNavigation();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [insurance, setInsurance] = useState<Insurance | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentSection, setCurrentSection] = useState<'vaccination' | 'prescription' | 'allergy' | 'insurance'>('vaccination');
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    provider: '',
    dosage: '',
    severity: 'Low'
  });

  useEffect(() => {
    loadData();
  }, [memberId]);

  const loadData = async () => {
    const [vaccinationsData, prescriptionsData, allergiesData, insuranceData] = await Promise.all([
      getVaccinations(memberId),
      getPrescriptions(memberId),
      getAllergies(memberId),
      getInsurance(memberId)
    ]);

    setVaccinations(vaccinationsData);
    setPrescriptions(prescriptionsData);
    setAllergies(allergiesData);
    setInsurance(insuranceData.length > 0 ? insuranceData[0] : null);
  };

  const handleAddItem = async () => {
    try {
      if (currentSection === 'vaccination') {
        const newVaccination = await addVaccination({
          memberId,
          name: formData.name,
          date: formData.date,
          provider: formData.provider
        });
        setVaccinations([newVaccination, ...vaccinations]);
      } else if (currentSection === 'prescription') {
        const newPrescription = await addPrescription({
          memberId,
          name: formData.name,
          dosage: formData.dosage,
          date: formData.date
        });
        setPrescriptions([newPrescription, ...prescriptions]);
      } else if (currentSection === 'allergy') {
        const newAllergy = await addAllergy({
          memberId,
          name: formData.name,
          severity: formData.severity
        });
        setAllergies([newAllergy, ...allergies]);
      } else if (currentSection === 'insurance') {
        const newInsurance = await addInsurance({
          memberId,
          name: formData.name,
          policyNumber: formData.provider,
          expirationDate: formData.date
        });
        setInsurance(newInsurance);
      }

      setShowAddModal(false);
      setFormData({
        name: '',
        date: '',
        provider: '',
        dosage: '',
        severity: 'Low'
      });
      Alert.alert('Success', 'Record added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add record');
    }
  };

  const generatePDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4CAF50; text-align: center; }
            h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
            .section { margin-bottom: 20px; }
            .item { margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
            .severity-high { color: #d32f2f; }
            .severity-medium { color: #ff9800; }
            .severity-low { color: #4caf50; }
          </style>
        </head>
        <body>
          <h1>Health Passport Summary</h1>

          <div class="section">
            <h2>Vaccination History</h2>
            ${vaccinations.map(v => `
              <div class="item">
                <strong>${v.name}</strong><br>
                Date: ${format(new Date(v.date), 'MMMM d, yyyy')}<br>
                Provider: ${v.provider || 'Not specified'}
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Prescriptions</h2>
            ${prescriptions.map(p => `
              <div class="item">
                <strong>${p.name}</strong><br>
                Dosage: ${p.dosage}<br>
                Date: ${format(new Date(p.date), 'MMMM d, yyyy')}
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Allergies</h2>
            ${allergies.map(a => `
              <div class="item">
                <strong>${a.name}</strong><br>
                Severity: <span class="severity-${a.severity.toLowerCase()}">${a.severity}</span>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <h2>Insurance Information</h2>
            ${insurance ? `
              <div class="item">
                <strong>${insurance.name}</strong><br>
                Policy Number: ${insurance.policyNumber}<br>
                Expiration: ${format(new Date(insurance.expirationDate), 'MMMM d, yyyy')}
              </div>
            ` : '<p>No insurance information available</p>'}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Health Passport' });
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const renderSection = (section: 'vaccination' | 'prescription' | 'allergy' | 'insurance') => {
    switch (section) {
      case 'vaccination':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vaccinations</Text>
            {vaccinations.map(v => (
              <View key={v.id} style={styles.item}>
                <Text style={styles.itemTitle}>{v.name}</Text>
                <Text>Date: {format(new Date(v.date), 'MMMM d, yyyy')}</Text>
                <Text>Provider: {v.provider}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setCurrentSection('vaccination');
                setShowAddModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Vaccination</Text>
            </TouchableOpacity>
          </View>
        );
      case 'prescription':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescriptions</Text>
            {prescriptions.map(p => (
              <View key={p.id} style={styles.item}>
                <Text style={styles.itemTitle}>{p.name}</Text>
                <Text>Dosage: {p.dosage}</Text>
                <Text>Date: {format(new Date(p.date), 'MMMM d, yyyy')}</Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setCurrentSection('prescription');
                setShowAddModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Prescription</Text>
            </TouchableOpacity>
          </View>
        );
      case 'allergy':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Allergies</Text>
            {allergies.map(a => (
              <View key={a.id} style={styles.item}>
                <Text style={styles.itemTitle}>{a.name}</Text>
                <Text style={[styles.severityText, styles[`severity${a.severity}`]]}>
                  Severity: {a.severity}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setCurrentSection('allergy');
                setShowAddModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Allergy</Text>
            </TouchableOpacity>
          </View>
        );
      case 'insurance':
        return (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insurance</Text>
            {insurance ? (
              <View style={styles.item}>
                <Text style={styles.itemTitle}>{insurance.name}</Text>
                <Text>Policy Number: {insurance.policyNumber}</Text>
                <Text>Expiration: {format(new Date(insurance.expirationDate), 'MMMM d, yyyy')}</Text>
              </View>
            ) : (
              <Text>No insurance information available</Text>
            )}
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                setCurrentSection('insurance');
                setShowAddModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Insurance</Text>
            </TouchableOpacity>
          </View>
        );
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Passport</Text>
        <TouchableOpacity style={styles.exportButton} onPress={generatePDF}>
          <Text style={styles.exportButtonText}>Export PDF</Text>
        </TouchableOpacity>
      </View>

      {renderSection('vaccination')}
      {renderSection('prescription')}
      {renderSection('allergy')}
      {renderSection('insurance')}

      <Modal visible={showAddModal} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>
            Add {currentSection.charAt(0).toUpperCase() + currentSection.slice(1)}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Name"
            value={formData.name}
            onChangeText={(text) => setFormData({...formData, name: text})}
          />

          {currentSection !== 'allergy' && (
            <TextInput
              style={styles.input}
              placeholder="Date (YYYY-MM-DD)"
              value={formData.date}
              onChangeText={(text) => setFormData({...formData, date: text})}
            />
          )}

          {currentSection === 'vaccination' && (
            <TextInput
              style={styles.input}
              placeholder="Provider"
              value={formData.provider}
              onChangeText={(text) => setFormData({...formData, provider: text})}
            />
          )}

          {currentSection === 'prescription' && (
            <TextInput
              style={styles.input}
              placeholder="Dosage"
              value={formData.dosage}
              onChangeText={(text) => setFormData({...formData, dosage: text})}
            />
          )}

          {currentSection === 'allergy' && (
            <View style={styles.severityContainer}>
              <Text>Severity:</Text>
              <View style={styles.severityOptions}>
                {['Low', 'Medium', 'High'].map(severity => (
                  <TouchableOpacity
                    key={severity}
                    style={[
                      styles.severityOption,
                      formData.severity === severity && styles.selectedSeverity
                    ]}
                    onPress={() => setFormData({...formData, severity})}
                  >
                    <Text style={[
                      styles.severityText,
                      styles[`severity${severity}`]
                    ]}>{severity}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={() => setShowAddModal(false)} />
            <Button title="Save" onPress={handleAddItem} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  item: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  severityContainer: {
    marginBottom: 15,
  },
  severityOptions: {
    flexDirection: 'row',
    marginTop: 10,
  },
  severityOption: {
    padding: 8,
    marginRight: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedSeverity: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  severityText: {
    fontSize: 14,
  },
  severityLow: {
    color: '#4CAF50',
  },
  severityMedium: {
    color: '#FF9800',
  },
  severityHigh: {
    color: '#D32F2F',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});
