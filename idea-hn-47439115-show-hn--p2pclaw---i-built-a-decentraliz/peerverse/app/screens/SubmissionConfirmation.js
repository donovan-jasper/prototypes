import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SubmissionConfirmation = ({ route, navigation }) => {
  const { submissionData } = route.params;

  const getStatusInfo = () => {
    if (submissionData.status === 'completed') {
      return {
        title: 'Submission Successful!',
        subtitle: 'Your paper has been submitted to PeerVerse',
        icon: 'checkmark-circle',
        color: '#4CAF50',
        details: [
          { label: 'Title', value: submissionData.title },
          { label: 'Authors', value: submissionData.authors },
          { label: 'IPFS Hash', value: submissionData.ipfsHash },
          { label: 'Firebase ID', value: submissionData.firebaseId },
          { label: 'Status', value: 'Processing' }
        ]
      };
    } else if (submissionData.status === 'offline') {
      return {
        title: 'Submission Queued',
        subtitle: 'Your paper will be submitted when you connect to the internet',
        icon: 'cloud-offline-outline',
        color: '#FFC107',
        details: [
          { label: 'Title', value: submissionData.title },
          { label: 'Authors', value: submissionData.authors },
          { label: 'Status', value: 'Queued for offline submission' }
        ]
      };
    } else {
      return {
        title: 'Submission Failed',
        subtitle: 'There was an error submitting your paper',
        icon: 'close-circle',
        color: '#F44336',
        details: [
          { label: 'Title', value: submissionData.title },
          { label: 'Authors', value: submissionData.authors },
          { label: 'Status', value: 'Failed' }
        ]
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <View style={styles.container}>
      <View style={styles.confirmationBox}>
        <View style={[styles.iconContainer, { backgroundColor: `${statusInfo.color}20` }]}>
          <Ionicons name={statusInfo.icon} size={40} color={statusInfo.color} />
        </View>

        <Text style={styles.title}>{statusInfo.title}</Text>
        <Text style={styles.subtitle}>{statusInfo.subtitle}</Text>

        <View style={styles.detailsContainer}>
          {statusInfo.details.map((detail, index) => (
            <View key={index} style={styles.detailItem}>
              <Text style={styles.detailLabel}>{detail.label}:</Text>
              <Text style={styles.detailValue}>{detail.value}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>

        {submissionData.status === 'offline' && (
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => navigation.navigate('SubmissionQueue')}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>View Queue</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  confirmationBox: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 24,
    textAlign: 'center',
  },
  detailsContainer: {
    marginBottom: 24,
  },
  detailItem: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#2c3e50',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
  },
});

export default SubmissionConfirmation;
