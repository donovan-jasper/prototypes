import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Vaccination, Prescription, Allergy, Insurance } from '../types';
import { getVaccinations, getPrescriptions, getAllergies, getInsurance, addVaccination, addPrescription, addAllergy, addInsurance } from '../lib/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';

interface HealthPassportProps {
  memberId: string;
}

export default function HealthPassport({ memberId }: HealthPassportProps) {
  const navigation = useNavigation();
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [insurance, setInsurance] = useState<Insurance | null>(null);

  // Form states
  const [newVaccination, setNewVaccination] = useState<Omit<Vaccination, 'id' | 'memberId'>>({
    name: '',
    date: '',
    provider: ''
  });
  const [newPrescription, setNewPrescription] = useState<Omit<Prescription, 'id' | 'memberId'>>({
    name: '',
    dosage: '',
    date: ''
  });
  const [newAllergy, setNewAllergy] = useState<Omit<Allergy, 'id' | 'memberId'>>({
    name: '',
    severity: ''
  });
  const [newInsurance, setNewInsurance] = useState<Omit<Insurance, 'id' | 'memberId'>>({
    name: '',
    policyNumber: '',
    expirationDate: ''
  });

  useEffect(() => {
    loadHealthData();
  }, [memberId]);

  const loadHealthData = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading health data:', error);
      Alert.alert('Error', 'Failed to load health data');
    }
  };

  const handleAddVaccination = async () => {
    if (!newVaccination.name || !newVaccination.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const vaccination = await addVaccination({
        ...newVaccination,
        memberId
      });
      setVaccinations([...vaccinations, vaccination]);
      setNewVaccination({ name: '', date: '', provider: '' });
    } catch (error) {
      console.error('Error adding vaccination:', error);
      Alert.alert('Error', 'Failed to add vaccination');
    }
  };

  const handleAddPrescription = async () => {
    if (!newPrescription.name || !newPrescription.dosage || !newPrescription.date) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const prescription = await addPrescription({
        ...newPrescription,
        memberId
      });
      setPrescriptions([...prescriptions, prescription]);
      setNewPrescription({ name: '', dosage: '', date: '' });
    } catch (error) {
      console.error('Error adding prescription:', error);
      Alert.alert('Error', 'Failed to add prescription');
    }
  };

  const handleAddAllergy = async () => {
    if (!newAllergy.name || !newAllergy.severity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const allergy = await addAllergy({
        ...newAllergy,
        memberId
      });
      setAllergies([...allergies, allergy]);
      setNewAllergy({ name: '', severity: '' });
    } catch (error) {
      console.error('Error adding allergy:', error);
      Alert.alert('Error', 'Failed to add allergy');
    }
  };

  const handleAddInsurance = async () => {
    if (!newInsurance.name || !newInsurance.policyNumber || !newInsurance.expirationDate) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const insuranceData = await addInsurance({
        ...newInsurance,
        memberId
      });
      setInsurance(insuranceData);
      setNewInsurance({ name: '', policyNumber: '', expirationDate: '' });
    } catch (error) {
      console.error('Error adding insurance:', error);
      Alert.alert('Error', 'Failed to add insurance');
    }
  };

  const generatePDF = async () => {
    try {
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #4CAF50; text-align: center; }
              h2 { color: #333; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .section { margin-bottom: 20px; }
              .item { margin-bottom: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 5px; }
              .label { font-weight: bold; color: #555; }
            </style>
          </head>
          <body>
            <h1>Health Passport</h1>

            <div class="section">
              <h2>Vaccinations</h2>
              ${vaccinations.map(v => `
                <div class="item">
                  <div><span class="label">Name:</span> ${v.name}</div>
                  <div><span class="label">Date:</span> ${v.date}</div>
                  <div><span class="label">Provider:</span> ${v.provider || 'N/A'}</div>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2>Prescriptions</h2>
              ${prescriptions.map(p => `
                <div class="item">
                  <div><span class="label">Name:</span> ${p.name}</div>
                  <div><span class="label">Dosage:</span> ${p.dosage}</div>
                  <div><span class="label">Date:</span> ${p.date}</div>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2>Allergies</h2>
              ${allergies.map(a => `
                <div class="item">
                  <div><span class="label">Name:</span> ${a.name}</div>
                  <div><span class="label">Severity:</span> ${a.severity}</div>
                </div>
              `).join('')}
            </div>

            <div class="section">
              <h2>Insurance</h2>
              ${insurance ? `
                <div class="item">
                  <div><span class="label">Provider:</span> ${insurance.name}</div>
                  <div><span class="label">Policy Number:</span> ${insurance.policyNumber}</div>
                  <div><span class="label">Expiration Date:</span> ${insurance.expirationDate}</div>
                </div>
              ` : '<p>No insurance information available</p>'}
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Health Passport' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert('Error', 'Failed to generate PDF');
    }
  };

  const renderSection = (title: string, items: any[], renderItem: (item: any) => React.ReactNode) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.length > 0 ? (
        items.map(item => (
          <View key={item.id} style={styles.item}>
            {renderItem(item)}
          </View>
        ))
      ) : (
        <Text style={styles.emptyText}>No {title.toLowerCase()} recorded</Text>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Vaccinations Section */}
      {renderSection('Vaccinations', vaccinations, (v) => (
        <>
          <Text style={styles.itemTitle}>{v.name}</Text>
          <Text style={styles.itemDetail}>Date: {v.date}</Text>
          {v.provider && <Text style={styles.itemDetail}>Provider: {v.provider}</Text>}
        </>
      ))}

      {/* Add Vaccination Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Add Vaccination</Text>
        <TextInput
          style={styles.input}
          placeholder="Vaccine Name"
          value={newVaccination.name}
          onChangeText={(text) => setNewVaccination({...newVaccination, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={newVaccination.date}
          onChangeText={(text) => setNewVaccination({...newVaccination, date: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Provider (optional)"
          value={newVaccination.provider}
          onChangeText={(text) => setNewVaccination({...newVaccination, provider: text})}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddVaccination}>
          <Text style={styles.addButtonText}>Add Vaccination</Text>
        </TouchableOpacity>
      </View>

      {/* Prescriptions Section */}
      {renderSection('Prescriptions', prescriptions, (p) => (
        <>
          <Text style={styles.itemTitle}>{p.name}</Text>
          <Text style={styles.itemDetail}>Dosage: {p.dosage}</Text>
          <Text style={styles.itemDetail}>Date: {p.date}</Text>
        </>
      ))}

      {/* Add Prescription Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Add Prescription</Text>
        <TextInput
          style={styles.input}
          placeholder="Medication Name"
          value={newPrescription.name}
          onChangeText={(text) => setNewPrescription({...newPrescription, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Dosage"
          value={newPrescription.dosage}
          onChangeText={(text) => setNewPrescription({...newPrescription, dosage: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={newPrescription.date}
          onChangeText={(text) => setNewPrescription({...newPrescription, date: text})}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddPrescription}>
          <Text style={styles.addButtonText}>Add Prescription</Text>
        </TouchableOpacity>
      </View>

      {/* Allergies Section */}
      {renderSection('Allergies', allergies, (a) => (
        <>
          <Text style={styles.itemTitle}>{a.name}</Text>
          <Text style={styles.itemDetail}>Severity: {a.severity}</Text>
        </>
      ))}

      {/* Add Allergy Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Add Allergy</Text>
        <TextInput
          style={styles.input}
          placeholder="Allergy Name"
          value={newAllergy.name}
          onChangeText={(text) => setNewAllergy({...newAllergy, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Severity (Mild/Moderate/Severe)"
          value={newAllergy.severity}
          onChangeText={(text) => setNewAllergy({...newAllergy, severity: text})}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddAllergy}>
          <Text style={styles.addButtonText}>Add Allergy</Text>
        </TouchableOpacity>
      </View>

      {/* Insurance Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Insurance</Text>
        {insurance ? (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{insurance.name}</Text>
            <Text style={styles.itemDetail}>Policy Number: {insurance.policyNumber}</Text>
            <Text style={styles.itemDetail}>Expiration Date: {insurance.expirationDate}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No insurance information recorded</Text>
        )}
      </View>

      {/* Add Insurance Form */}
      <View style={styles.formSection}>
        <Text style={styles.formTitle}>Add Insurance</Text>
        <TextInput
          style={styles.input}
          placeholder="Insurance Provider"
          value={newInsurance.name}
          onChangeText={(text) => setNewInsurance({...newInsurance, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Policy Number"
          value={newInsurance.policyNumber}
          onChangeText={(text) => setNewInsurance({...newInsurance, policyNumber: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Expiration Date (YYYY-MM-DD)"
          value={newInsurance.expirationDate}
          onChangeText={(text) => setNewInsurance({...newInsurance, expirationDate: text})}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddInsurance}>
          <Text style={styles.addButtonText}>Add Insurance</Text>
        </TouchableOpacity>
      </View>

      {/* PDF Export Button */}
      <View style={styles.pdfButtonContainer}>
        <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
          <Text style={styles.pdfButtonText}>Export as PDF</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
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
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  pdfButtonContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  pdfButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
});
