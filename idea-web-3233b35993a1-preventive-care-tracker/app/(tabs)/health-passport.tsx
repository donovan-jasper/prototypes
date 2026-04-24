import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView, TextInput, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FamilyMember, Vaccination, Allergy, Insurance } from '../../types';
import { getFamilyMembers, getVaccinations, getAllergies, getInsurance, addVaccination, addAllergy, addInsurance } from '../../lib/database';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function HealthPassportScreen() {
  const navigation = useNavigation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
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

    setVaccinations(vaccinationsData);
    setAllergies(allergiesData);
    setInsurance(insuranceData);
  };

  const handleAddVaccination = async () => {
    if (!selectedMemberId || !newVaccination.name || !newVaccination.date) return;

    const vaccination = await addVaccination({
      memberId: selectedMemberId,
      name: newVaccination.name,
      date: newVaccination.date,
      provider: newVaccination.provider
    });

    setVaccinations([vaccination, ...vaccinations]);
    setNewVaccination({ name: '', date: '', provider: '' });
  };

  const handleAddAllergy = async () => {
    if (!selectedMemberId || !newAllergy.name || !newAllergy.severity) return;

    const allergy = await addAllergy({
      memberId: selectedMemberId,
      name: newAllergy.name,
      severity: newAllergy.severity
    });

    setAllergies([allergy, ...allergies]);
    setNewAllergy({ name: '', severity: '' });
  };

  const handleAddInsurance = async () => {
    if (!selectedMemberId || !newInsurance.name || !newInsurance.policyNumber || !newInsurance.expirationDate) return;

    const insuranceData = await addInsurance({
      memberId: selectedMemberId,
      name: newInsurance.name,
      policyNumber: newInsurance.policyNumber,
      expirationDate: newInsurance.expirationDate
    });

    setInsurance(insuranceData);
    setNewInsurance({ name: '', policyNumber: '', expirationDate: '' });
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
          </style>
        </head>
        <body>
          <h1>Health Passport - ${member.name}</h1>

          <div class="section">
            <h2 class="section-title">Personal Information</h2>
            <p><strong>Name:</strong> ${member.name}</p>
            <p><strong>Date of Birth:</strong> ${member.birthDate}</p>
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
                    <td>${v.date}</td>
                    <td>${v.provider || '-'}</td>
                  </tr>
                `).join('')}
              </table>
            ` : '<p>No vaccinations recorded</p>'}
          </div>

          <div class="section">
            <h2 class="section-title">Allergies</h2>
            ${allergies.length > 0 ? `
              <table>
                <tr>
                  <th>Allergy</th>
                  <th>Severity</th>
                </tr>
                ${allergies.map(a => `
                  <tr>
                    <td>${a.name}</td>
                    <td>${a.severity}</td>
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
              <p><strong>Expiration Date:</strong> ${insurance.expirationDate}</p>
            ` : '<p>No insurance information recorded</p>'}
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Health Passport' });
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  const renderMemberTab = ({ item }: { item: FamilyMember }) => (
    <TouchableOpacity
      style={[
        styles.memberTab,
        selectedMemberId === item.id && styles.selectedMemberTab
      ]}
      onPress={() => setSelectedMemberId(item.id)}
    >
      <Text style={[
        styles.memberTabText,
        selectedMemberId === item.id && styles.selectedMemberTabText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Passport</Text>
        {selectedMemberId && (
          <TouchableOpacity style={styles.exportButton} onPress={generatePDF}>
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>
        )}
      </View>

      {members.length > 0 ? (
        <>
          <FlatList
            data={members}
            renderItem={renderMemberTab}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.memberTabs}
          />

          {selectedMemberId && (
            <ScrollView style={styles.content}>
              {/* Vaccinations Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Vaccinations</Text>
                {vaccinations.length > 0 ? (
                  <FlatList
                    data={vaccinations}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.item}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemDetail}>Date: {item.date}</Text>
                        {item.provider && <Text style={styles.itemDetail}>Provider: {item.provider}</Text>}
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.emptyText}>No vaccinations recorded</Text>
                )}

                <View style={styles.form}>
                  <Text style={styles.formTitle}>Add Vaccination</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Vaccine Name"
                    value={newVaccination.name}
                    onChangeText={text => setNewVaccination({...newVaccination, name: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Date (YYYY-MM-DD)"
                    value={newVaccination.date}
                    onChangeText={text => setNewVaccination({...newVaccination, date: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Provider (optional)"
                    value={newVaccination.provider}
                    onChangeText={text => setNewVaccination({...newVaccination, provider: text})}
                  />
                  <Button title="Add Vaccination" onPress={handleAddVaccination} />
                </View>
              </View>

              {/* Allergies Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Allergies</Text>
                {allergies.length > 0 ? (
                  <FlatList
                    data={allergies}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                      <View style={styles.item}>
                        <Text style={styles.itemTitle}>{item.name}</Text>
                        <Text style={styles.itemDetail}>Severity: {item.severity}</Text>
                      </View>
                    )}
                  />
                ) : (
                  <Text style={styles.emptyText}>No allergies recorded</Text>
                )}

                <View style={styles.form}>
                  <Text style={styles.formTitle}>Add Allergy</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Allergy Name"
                    value={newAllergy.name}
                    onChangeText={text => setNewAllergy({...newAllergy, name: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Severity (Mild/Moderate/Severe)"
                    value={newAllergy.severity}
                    onChangeText={text => setNewAllergy({...newAllergy, severity: text})}
                  />
                  <Button title="Add Allergy" onPress={handleAddAllergy} />
                </View>
              </View>

              {/* Insurance Section */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Insurance Information</Text>
                {insurance ? (
                  <View style={styles.item}>
                    <Text style={styles.itemTitle}>{insurance.name}</Text>
                    <Text style={styles.itemDetail}>Policy: {insurance.policyNumber}</Text>
                    <Text style={styles.itemDetail}>Expires: {insurance.expirationDate}</Text>
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No insurance information recorded</Text>
                )}

                <View style={styles.form}>
                  <Text style={styles.formTitle}>Add/Update Insurance</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Insurance Provider"
                    value={newInsurance.name}
                    onChangeText={text => setNewInsurance({...newInsurance, name: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Policy Number"
                    value={newInsurance.policyNumber}
                    onChangeText={text => setNewInsurance({...newInsurance, policyNumber: text})}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Expiration Date (YYYY-MM-DD)"
                    value={newInsurance.expirationDate}
                    onChangeText={text => setNewInsurance({...newInsurance, expirationDate: text})}
                  />
                  <Button title="Save Insurance" onPress={handleAddInsurance} />
                </View>
              </View>
            </ScrollView>
          )}
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No family members found. Please add members first.</Text>
          <TouchableOpacity
            style={styles.addMemberButton}
            onPress={() => navigation.navigate('member/add')}
          >
            <Text style={styles.addMemberButtonText}>Add Family Member</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
  },
  exportButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  memberTabs: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  memberTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  selectedMemberTab: {
    backgroundColor: '#4CAF50',
  },
  memberTabText: {
    color: '#333',
    fontWeight: '500',
  },
  selectedMemberTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginVertical: 16,
  },
  form: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4CAF50',
    marginBottom: 12,
  },
  input: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  addMemberButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
  },
  addMemberButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
