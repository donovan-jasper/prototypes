import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FamilyMember, Vaccination, Allergy, Insurance, Prescription } from '../../types';
import { getFamilyMembers, getVaccinations, getAllergies, getInsurance, addVaccination, addAllergy, addInsurance, getPrescriptions, addPrescription, deleteVaccination, deleteAllergy, deletePrescription } from '../../lib/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as SecureStore from 'expo-secure-store';
import { format } from 'date-fns';

export default function HealthPassportScreen() {
  const navigation = useNavigation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [insurance, setInsurance] = useState<Insurance | null>(null);

  // Form states
  const [newVaccination, setNewVaccination] = useState({
    name: '',
    date: '',
    provider: ''
  });
  const [newAllergy, setNewAllergy] = useState({
    name: '',
    severity: ''
  });
  const [newPrescription, setNewPrescription] = useState({
    name: '',
    dosage: '',
    date: ''
  });
  const [newInsurance, setNewInsurance] = useState({
    name: '',
    policyNumber: '',
    expirationDate: ''
  });

  useEffect(() => {
    loadMembers();
  }, []);

  useEffect(() => {
    if (selectedMemberId) {
      loadMemberData(selectedMemberId);
    }
  }, [selectedMemberId]);

  const loadMembers = async () => {
    const data = await getFamilyMembers();
    setMembers(data);
    if (data.length > 0) {
      setSelectedMemberId(data[0].id);
    }
  };

  const loadMemberData = async (memberId: string) => {
    const vaccinationsData = await getVaccinations(memberId);
    const allergiesData = await getAllergies(memberId);
    const insuranceData = await getInsurance(memberId);
    const prescriptionsData = await getPrescriptions(memberId);

    setVaccinations(vaccinationsData);
    setAllergies(allergiesData);
    setInsurance(insuranceData);
    setPrescriptions(prescriptionsData);
  };

  const handleAddVaccination = async () => {
    if (!selectedMemberId || !newVaccination.name || !newVaccination.date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const vaccination = await addVaccination({
        memberId: selectedMemberId,
        name: newVaccination.name,
        date: newVaccination.date,
        provider: newVaccination.provider
      });

      setVaccinations([vaccination, ...vaccinations]);
      setNewVaccination({ name: '', date: '', provider: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to add vaccination');
    }
  };

  const handleDeleteVaccination = async (id: string) => {
    try {
      await deleteVaccination(id);
      setVaccinations(vaccinations.filter(v => v.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete vaccination');
    }
  };

  const handleAddAllergy = async () => {
    if (!selectedMemberId || !newAllergy.name || !newAllergy.severity) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const allergy = await addAllergy({
        memberId: selectedMemberId,
        name: newAllergy.name,
        severity: newAllergy.severity
      });

      setAllergies([allergy, ...allergies]);
      setNewAllergy({ name: '', severity: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to add allergy');
    }
  };

  const handleDeleteAllergy = async (id: string) => {
    try {
      await deleteAllergy(id);
      setAllergies(allergies.filter(a => a.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete allergy');
    }
  };

  const handleAddPrescription = async () => {
    if (!selectedMemberId || !newPrescription.name || !newPrescription.dosage || !newPrescription.date) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const prescription = await addPrescription({
        memberId: selectedMemberId,
        name: newPrescription.name,
        dosage: newPrescription.dosage,
        date: newPrescription.date
      });

      setPrescriptions([prescription, ...prescriptions]);
      setNewPrescription({ name: '', dosage: '', date: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to add prescription');
    }
  };

  const handleDeletePrescription = async (id: string) => {
    try {
      await deletePrescription(id);
      setPrescriptions(prescriptions.filter(p => p.id !== id));
    } catch (error) {
      Alert.alert('Error', 'Failed to delete prescription');
    }
  };

  const handleAddInsurance = async () => {
    if (!selectedMemberId || !newInsurance.name || !newInsurance.policyNumber || !newInsurance.expirationDate) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    try {
      const insuranceData = await addInsurance({
        memberId: selectedMemberId,
        name: newInsurance.name,
        policyNumber: newInsurance.policyNumber,
        expirationDate: newInsurance.expirationDate
      });

      setInsurance(insuranceData);
      setNewInsurance({ name: '', policyNumber: '', expirationDate: '' });
    } catch (error) {
      Alert.alert('Error', 'Failed to add insurance');
    }
  };

  const generatePDF = async () => {
    if (!selectedMemberId) return;

    const member = members.find(m => m.id === selectedMemberId);
    if (!member) return;

    const html = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #4CAF50; }
            .section { margin-bottom: 20px; }
            .section-title { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .severity-high { color: #d32f2f; }
            .severity-medium { color: #ff9800; }
            .severity-low { color: #4caf50; }
          </style>
        </head>
        <body>
          <h1>Health Passport - ${member.name}</h1>

          <div class="section">
            <h2 class="section-title">Personal Information</h2>
            <p><strong>Name:</strong> ${member.name}</p>
            <p><strong>Date of Birth:</strong> ${format(new Date(member.birthDate), 'MMMM d, yyyy')}</p>
            <p><strong>Relationship:</strong> ${member.relationship}</p>
          </div>

          <div class="section">
            <h2 class="section-title">Vaccinations</h2>
            ${vaccinations.length > 0 ? `
              <table>
                <tr>
                  <th>Vaccine</th>
                  <th>Date</th>
                  <th>Provider</th>
                </tr>
                ${vaccinations.map(v => `
                  <tr>
                    <td>${v.name}</td>
                    <td>${format(new Date(v.date), 'MMMM d, yyyy')}</td>
                    <td>${v.provider || '-'}</td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p>No vaccinations recorded</p>'}
          </div>

          <div class="section">
            <h2 class="section-title">Prescriptions</h2>
            ${prescriptions.length > 0 ? `
              <table>
                <tr>
                  <th>Medication</th>
                  <th>Dosage</th>
                  <th>Date</th>
                </tr>
                ${prescriptions.map(p => `
                  <tr>
                    <td>${p.name}</td>
                    <td>${p.dosage}</td>
                    <td>${format(new Date(p.date), 'MMMM d, yyyy')}</td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p>No prescriptions recorded</p>'}
          </div>

          <div class="section">
            <h2 class="section-title">Allergies</h2>
            ${allergies.length > 0 ? `
              <table>
                <tr>
                  <th>Allergen</th>
                  <th>Severity</th>
                </tr>
                ${allergies.map(a => `
                  <tr>
                    <td>${a.name}</td>
                    <td class="severity-${a.severity.toLowerCase()}">${a.severity}</td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p>No allergies recorded</p>'}
          </div>

          <div class="section">
            <h2 class="section-title">Insurance Information</h2>
            ${insurance ? `
              <p><strong>Provider:</strong> ${insurance.name}</p>
              <p><strong>Policy Number:</strong> ${insurance.policyNumber}</p>
              <p><strong>Expiration Date:</strong> ${format(new Date(insurance.expirationDate), 'MMMM d, yyyy')}</p>
            ` : '<p>No insurance information recorded</p>'}
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

  const renderMemberSelector = () => (
    <View style={styles.memberSelector}>
      <Text style={styles.sectionTitle}>Select Family Member</Text>
      <FlatList
        horizontal
        data={members}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.memberButton,
              selectedMemberId === item.id && styles.selectedMemberButton
            ]}
            onPress={() => setSelectedMemberId(item.id)}
          >
            <Text style={[
              styles.memberButtonText,
              selectedMemberId === item.id && styles.selectedMemberButtonText
            ]}>
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderVaccinationSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Vaccination History</Text>
      <FlatList
        data={vaccinations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>
                {format(new Date(item.date), 'MMMM d, yyyy')} - {item.provider || 'Unknown provider'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteVaccination(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No vaccinations recorded</Text>}
      />

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Vaccine name"
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
        <Button title="Add Vaccination" onPress={handleAddVaccination} />
      </View>
    </View>
  );

  const renderPrescriptionSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Prescription Tracker</Text>
      <FlatList
        data={prescriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={styles.itemSubtitle}>
                {item.dosage} - {format(new Date(item.date), 'MMMM d, yyyy')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeletePrescription(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No prescriptions recorded</Text>}
      />

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Medication name"
          value={newPrescription.name}
          onChangeText={(text) => setNewPrescription({...newPrescription, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Dosage (e.g., 1 tablet daily)"
          value={newPrescription.dosage}
          onChangeText={(text) => setNewPrescription({...newPrescription, dosage: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Date (YYYY-MM-DD)"
          value={newPrescription.date}
          onChangeText={(text) => setNewPrescription({...newPrescription, date: text})}
        />
        <Button title="Add Prescription" onPress={handleAddPrescription} />
      </View>
    </View>
  );

  const renderAllergySection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Allergy List</Text>
      <FlatList
        data={allergies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <View style={styles.itemContent}>
              <Text style={styles.itemTitle}>{item.name}</Text>
              <Text style={[
                styles.itemSubtitle,
                item.severity === 'High' && styles.severityHigh,
                item.severity === 'Medium' && styles.severityMedium,
                item.severity === 'Low' && styles.severityLow
              ]}>
                Severity: {item.severity}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteAllergy(item.id)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No allergies recorded</Text>}
      />

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Allergen name"
          value={newAllergy.name}
          onChangeText={(text) => setNewAllergy({...newAllergy, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Severity (Low/Medium/High)"
          value={newAllergy.severity}
          onChangeText={(text) => setNewAllergy({...newAllergy, severity: text})}
        />
        <Button title="Add Allergy" onPress={handleAddAllergy} />
      </View>
    </View>
  );

  const renderInsuranceSection = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Insurance Information</Text>
      {insurance ? (
        <View style={styles.itemContainer}>
          <View style={styles.itemContent}>
            <Text style={styles.itemTitle}>{insurance.name}</Text>
            <Text style={styles.itemSubtitle}>Policy: {insurance.policyNumber}</Text>
            <Text style={styles.itemSubtitle}>Expires: {format(new Date(insurance.expirationDate), 'MMMM d, yyyy')}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.emptyText}>No insurance information recorded</Text>
      )}

      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Insurance provider"
          value={newInsurance.name}
          onChangeText={(text) => setNewInsurance({...newInsurance, name: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Policy number"
          value={newInsurance.policyNumber}
          onChangeText={(text) => setNewInsurance({...newInsurance, policyNumber: text})}
        />
        <TextInput
          style={styles.input}
          placeholder="Expiration date (YYYY-MM-DD)"
          value={newInsurance.expirationDate}
          onChangeText={(text) => setNewInsurance({...newInsurance, expirationDate: text})}
        />
        <Button title="Update Insurance" onPress={handleAddInsurance} />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {renderMemberSelector()}

      <View style={styles.contentContainer}>
        {renderVaccinationSection()}
        {renderPrescriptionSection()}
        {renderAllergySection()}
        {renderInsuranceSection()}

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
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
  },
  memberSelector: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#4CAF50',
  },
  memberButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedMemberButton: {
    backgroundColor: '#4CAF50',
  },
  memberButtonText: {
    color: '#333',
  },
  selectedMemberButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#ffebee',
    borderRadius: 4,
  },
  deleteButtonText: {
    color: '#d32f2f',
    fontSize: 12,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  formContainer: {
    marginTop: 16,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  pdfButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  pdfButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  severityHigh: {
    color: '#d32f2f',
  },
  severityMedium: {
    color: '#ff9800',
  },
  severityLow: {
    color: '#4caf50',
  },
});
