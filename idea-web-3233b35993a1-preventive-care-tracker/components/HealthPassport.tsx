import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Vaccination, Prescription, Allergy, Insurance } from '../types';
import { getVaccinations, getPrescriptions, getAllergies, getInsurance, addInsurance } from '../lib/database';
import { Camera } from 'expo-camera';
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
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  useEffect(() => {
    loadData();
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(status === 'granted');
    })();
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

  const handleScanInsurance = async () => {
    if (hasCameraPermission === null) {
      Alert.alert('Permission required', 'Please allow camera access to scan insurance card');
      return;
    }

    if (hasCameraPermission === false) {
      Alert.alert('Permission denied', 'Camera access is required to scan insurance card');
      return;
    }

    setCameraVisible(true);
  };

  const handleCameraClose = () => {
    setCameraVisible(false);
  };

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    setCameraVisible(false);

    // In a real app, you would parse the scanned data and extract insurance information
    // For this example, we'll just create a mock insurance record
    const mockInsurance: Omit<Insurance, 'id'> = {
      memberId,
      name: 'Mock Insurance Provider',
      policyNumber: data.substring(0, 12),
      expirationDate: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')
    };

    try {
      const newInsurance = await addInsurance(mockInsurance);
      setInsurance(newInsurance);
      Alert.alert('Success', 'Insurance information added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save insurance information');
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
                Expires: ${format(new Date(insurance.expirationDate), 'MMMM d, yyyy')}
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

  const renderSectionHeader = (title: string, onAdd: () => void) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <TouchableOpacity onPress={onAdd} style={styles.addButton}>
        <Text style={styles.addButtonText}>+ Add</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Vaccination History Section */}
      <View style={styles.section}>
        {renderSectionHeader('Vaccination History', () => navigation.navigate('vaccination/add', { memberId }))}
        {vaccinations.length > 0 ? (
          vaccinations.map(vaccination => (
            <TouchableOpacity
              key={vaccination.id}
              style={styles.item}
              onPress={() => navigation.navigate('vaccination/edit', { id: vaccination.id })}
            >
              <Text style={styles.itemTitle}>{vaccination.name}</Text>
              <Text style={styles.itemDate}>{format(new Date(vaccination.date), 'MMMM d, yyyy')}</Text>
              <Text style={styles.itemProvider}>{vaccination.provider}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No vaccinations recorded</Text>
        )}
      </View>

      {/* Prescription Tracker Section */}
      <View style={styles.section}>
        {renderSectionHeader('Prescription Tracker', () => navigation.navigate('prescription/add', { memberId }))}
        {prescriptions.length > 0 ? (
          prescriptions.map(prescription => (
            <TouchableOpacity
              key={prescription.id}
              style={styles.item}
              onPress={() => navigation.navigate('prescription/edit', { id: prescription.id })}
            >
              <Text style={styles.itemTitle}>{prescription.name}</Text>
              <Text style={styles.itemDate}>{format(new Date(prescription.date), 'MMMM d, yyyy')}</Text>
              <Text style={styles.itemDosage}>{prescription.dosage}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No prescriptions recorded</Text>
        )}
      </View>

      {/* Allergy Management Section */}
      <View style={styles.section}>
        {renderSectionHeader('Allergy Management', () => navigation.navigate('allergy/add', { memberId }))}
        {allergies.length > 0 ? (
          allergies.map(allergy => (
            <TouchableOpacity
              key={allergy.id}
              style={styles.item}
              onPress={() => navigation.navigate('allergy/edit', { id: allergy.id })}
            >
              <Text style={styles.itemTitle}>{allergy.name}</Text>
              <Text style={[
                styles.itemSeverity,
                allergy.severity === 'High' && styles.severityHigh,
                allergy.severity === 'Medium' && styles.severityMedium,
                allergy.severity === 'Low' && styles.severityLow
              ]}>
                Severity: {allergy.severity}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>No allergies recorded</Text>
        )}
      </View>

      {/* Insurance Card Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Insurance Information</Text>
          <TouchableOpacity onPress={handleScanInsurance} style={styles.scanButton}>
            <Text style={styles.scanButtonText}>Scan Card</Text>
          </TouchableOpacity>
        </View>
        {insurance ? (
          <View style={styles.item}>
            <Text style={styles.itemTitle}>{insurance.name}</Text>
            <Text style={styles.itemDate}>Policy: {insurance.policyNumber}</Text>
            <Text style={styles.itemDate}>Expires: {format(new Date(insurance.expirationDate), 'MMMM d, yyyy')}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>No insurance information available</Text>
        )}
      </View>

      {/* PDF Export Button */}
      <TouchableOpacity style={styles.pdfButton} onPress={generatePDF}>
        <Text style={styles.pdfButtonText}>Export as PDF</Text>
      </TouchableOpacity>

      {/* Camera Modal */}
      {cameraVisible && (
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            onBarCodeScanned={handleBarCodeScanned}
            barCodeScannerSettings={{
              barCodeTypes: [Camera.Constants.BarCodeType.qr, Camera.Constants.BarCodeType.code128],
            }}
          />
          <TouchableOpacity style={styles.closeButton} onPress={handleCameraClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      )}
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: '#333',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  scanButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  item: {
    padding: 12,
    borderRadius: 6,
    backgroundColor: '#f9f9f9',
    marginBottom: 8,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  itemProvider: {
    fontSize: 14,
    color: '#666',
  },
  itemDosage: {
    fontSize: 14,
    color: '#666',
  },
  itemSeverity: {
    fontSize: 14,
    fontWeight: '500',
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
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    padding: 16,
  },
  pdfButton: {
    backgroundColor: '#673AB7',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  pdfButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  cameraContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'black',
    zIndex: 100,
  },
  camera: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
