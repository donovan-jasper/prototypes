import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Clipboard } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

const SubmissionConfirmationScreen = ({ route, navigation }) => {
  const { submissionData } = route.params;

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    alert('Copied to clipboard!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Submission Confirmed</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Paper</Text>
          <Text style={styles.paperTitle}>{submissionData.title}</Text>
          <Text style={styles.authors}>{submissionData.authors}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cryptographic Proof</Text>
          <Text style={styles.proofText}>{submissionData.proof}</Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(submissionData.proof)}
          >
            <Text style={styles.copyButtonText}>Copy Proof</Text>
          </TouchableOpacity>

          <View style={styles.qrContainer}>
            <QRCode
              value={submissionData.proof}
              size={200}
              color="black"
              backgroundColor="white"
            />
          </View>

          <Text style={styles.instructions}>
            This QR code contains the cryptographic proof of your submission.
            You can scan it to verify the integrity of your paper at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>IPFS Verification</Text>
          <Text style={styles.ipfsText}>
            Your paper has been stored on IPFS with CID: {submissionData.ipfsCid || 'Processing...'}
          </Text>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={() => copyToClipboard(submissionData.ipfsCid || '')}
            disabled={!submissionData.ipfsCid}
          >
            <Text style={styles.copyButtonText}>Copy CID</Text>
          </TouchableOpacity>

          <Text style={styles.instructions}>
            To verify your submission, you can:
            {'\n'}1. Scan this QR code
            {'\n'}2. Visit https://ipfs.io/ipfs/{submissionData.ipfsCid || '[CID]'}
            {'\n'}3. Use our verification tool at https://peerverse.app/verify
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paperTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  authors: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 12,
  },
  proofText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  ipfsText: {
    fontSize: 14,
    color: '#2c3e50',
    marginBottom: 16,
    fontFamily: 'monospace',
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: 20,
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  instructions: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  copyButtonText: {
    color: '#333',
    fontSize: 14,
  },
});

export default SubmissionConfirmationScreen;
