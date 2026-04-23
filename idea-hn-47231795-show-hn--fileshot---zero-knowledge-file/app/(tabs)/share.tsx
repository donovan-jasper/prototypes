import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useFileVault } from '@/hooks/useFileVault';
import { useP2PTransfer } from '@/hooks/useP2PTransfer';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { ExpirationPicker } from '@/components/ExpirationPicker';
import { P2PTransferModal } from '@/components/P2PTransferModal';
import { PremiumGate } from '@/components/PremiumGate';
import { useSubscription } from '@/hooks/useSubscription';

export default function ShareScreen() {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: number;
    uri: string;
    mimeType: string;
  } | null>(null);
  const [expirationHours, setExpirationHours] = useState(24);
  const [isP2PModalVisible, setIsP2PModalVisible] = useState(false);
  const [isSendingP2P, setIsSendingP2P] = useState(false);
  const { addNewFile, canShare, getRemainingShares } = useFileVault();
  const { isPremium } = useSubscription();
  const { discoverPeers } = useP2PTransfer();

  const pickImage = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFile({
        name: result.assets[0].fileName || 'image.jpg',
        size: result.assets[0].fileSize || 0,
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
      });
    }
  }, []);

  const pickDocument = useCallback(async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.type === 'success') {
      setSelectedFile({
        name: result.name,
        size: result.size,
        uri: result.uri,
        mimeType: result.mimeType || 'application/octet-stream',
      });
    }
  }, []);

  const takePhoto = useCallback(async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedFile({
        name: result.assets[0].fileName || 'photo.jpg',
        size: result.assets[0].fileSize || 0,
        uri: result.assets[0].uri,
        mimeType: result.assets[0].mimeType || 'image/jpeg',
      });
    }
  }, []);

  const handleShare = async () => {
    if (!selectedFile) return;

    if (!canShare()) {
      Alert.alert(
        'Share Limit Reached',
        'You\'ve reached your free share limit. Upgrade to premium for unlimited shares.',
        [
          { text: 'Cancel' },
          { text: 'Upgrade', onPress: () => {} } // In a real app, this would navigate to upgrade screen
        ]
      );
      return;
    }

    try {
      // Add file to vault
      const fileId = await addNewFile({
        name: selectedFile.name,
        size: selectedFile.size,
        path: selectedFile.uri,
        encrypted: true,
      });

      // Generate share link (implementation would go here)
      const shareLink = `filevault://receive/${fileId}?exp=${Date.now() + expirationHours * 60 * 60 * 1000}`;

      // Show share options
      Alert.alert(
        'File Ready to Share',
        'Copy the link or use the share button below',
        [
          { text: 'Copy Link', onPress: () => {} },
          { text: 'Share', onPress: () => {} },
          { text: 'Cancel' }
        ]
      );
    } catch (error) {
      console.error('Error sharing file:', error);
      Alert.alert('Error', 'Failed to share file. Please try again.');
    }
  };

  const handleP2PTransfer = async () => {
    if (!selectedFile) return;

    if (!canShare()) {
      Alert.alert(
        'Share Limit Reached',
        'You\'ve reached your free share limit. Upgrade to premium for unlimited shares.',
        [
          { text: 'Cancel' },
          { text: 'Upgrade', onPress: () => {} }
        ]
      );
      return;
    }

    try {
      // Add file to vault
      const fileId = await addNewFile({
        name: selectedFile.name,
        size: selectedFile.size,
        path: selectedFile.uri,
        encrypted: true,
      });

      // Discover peers
      const peers = await discoverPeers();

      if (peers.length === 0) {
        Alert.alert(
          'No Devices Found',
          'No other devices were found on your network. Make sure both devices are on the same WiFi.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Show P2P transfer modal
      setIsSendingP2P(true);
      setIsP2PModalVisible(true);
    } catch (error) {
      console.error('Error preparing P2P transfer:', error);
      Alert.alert('Error', 'Failed to prepare P2P transfer. Please try again.');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Share a File</Text>

      {!isPremium && (
        <View style={styles.shareLimitContainer}>
          <Text style={styles.shareLimitText}>
            {getRemainingShares()} shares remaining this month
          </Text>
        </View>
      )}

      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
          <Ionicons name="camera-outline" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Ionicons name="image-outline" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Choose Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={pickDocument}>
          <Ionicons name="document-outline" size={24} color={Colors.primary} />
          <Text style={styles.actionButtonText}>Choose File</Text>
        </TouchableOpacity>
      </View>

      {selectedFile && (
        <View style={styles.filePreview}>
          <View style={styles.fileInfo}>
            <Ionicons
              name={selectedFile.mimeType.startsWith('image/') ? 'image-outline' : 'document-outline'}
              size={40}
              color={Colors.primary}
            />
            <View style={styles.fileDetails}>
              <Text style={styles.fileName} numberOfLines={1}>{selectedFile.name}</Text>
              <Text style={styles.fileSize}>{formatFileSize(selectedFile.size)}</Text>
            </View>
          </View>

          <View style={styles.expirationContainer}>
            <Text style={styles.expirationLabel}>Link expires in:</Text>
            <ExpirationPicker
              selectedHours={expirationHours}
              onSelect={setExpirationHours}
            />
          </View>

          <View style={styles.shareOptions}>
            <TouchableOpacity
              style={[styles.shareButton, styles.p2pButton]}
              onPress={handleP2PTransfer}
            >
              <Ionicons name="wifi-outline" size={20} color={Colors.white} />
              <Text style={styles.shareButtonText}>P2P Transfer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.shareButton, styles.linkButton]}
              onPress={handleShare}
            >
              <Ionicons name="link-outline" size={20} color={Colors.white} />
              <Text style={styles.shareButtonText}>Generate Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!isPremium && (
        <PremiumGate
          title="Unlock Unlimited Shares"
          description="Upgrade to premium to share files without limits and get faster transfers."
          buttonText="Upgrade Now"
          onUpgrade={() => {}}
        />
      )}

      <P2PTransferModal
        visible={isP2PModalVisible}
        onClose={() => setIsP2PModalVisible(false)}
        fileId={selectedFile?.uri} // In a real app, this would be the file ID from the database
        isSender={isSendingP2P}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  shareLimitContainer: {
    backgroundColor: Colors.lightPrimary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  shareLimitText: {
    color: Colors.primary,
    fontSize: 16,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
    padding: 15,
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonText: {
    marginTop: 8,
    color: Colors.text,
    fontSize: 14,
    textAlign: 'center',
  },
  filePreview: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  fileDetails: {
    marginLeft: 15,
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  fileSize: {
    fontSize: 14,
    color: Colors.gray,
    marginTop: 4,
  },
  expirationContainer: {
    marginBottom: 20,
  },
  expirationLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 10,
  },
  shareOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  p2pButton: {
    backgroundColor: Colors.success,
  },
  linkButton: {
    backgroundColor: Colors.primary,
  },
  shareButtonText: {
    color: Colors.white,
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
});
