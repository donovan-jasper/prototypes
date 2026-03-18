import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

interface Props {
  token: string;
  expiryTime: number;
  onClose: () => void;
}

export default function QRCodeGenerator({ token, expiryTime, onClose }: Props) {
  const handleShare = async () => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      const message = `HumanGuard Verification Token:\n${token}\n\nExpires: ${new Date(expiryTime).toLocaleString()}`;
      
      await Sharing.shareAsync('data:text/plain;base64,' + btoa(message), {
        mimeType: 'text/plain',
        dialogTitle: 'Share Verification Token',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share token');
    }
  };

  const handleCopy = async () => {
    try {
      await Clipboard.setStringAsync(token);
      Alert.alert('Success', 'Token copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy token');
    }
  };

  const getTimeRemaining = () => {
    const now = Date.now();
    const remaining = expiryTime - now;
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verification Token</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.qrContainer}>
        <QRCode
          value={token}
          size={200}
          backgroundColor="white"
          color="black"
        />
      </View>

      <View style={styles.expiryContainer}>
        <Text style={styles.expiryLabel}>Expires in</Text>
        <Text style={styles.expiryTime}>{getTimeRemaining()}</Text>
        <Text style={styles.expiryDate}>
          {new Date(expiryTime).toLocaleString()}
        </Text>
      </View>

      <View style={styles.tokenContainer}>
        <Text style={styles.tokenLabel}>Token</Text>
        <Text style={styles.tokenText} numberOfLines={2} ellipsizeMode="middle">
          {token}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
          <Text style={styles.actionText}>Copy Token</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={handleShare}>
          <Text style={[styles.actionText, styles.shareText]}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#8E8E93',
  },
  qrContainer: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginBottom: 20,
  },
  expiryContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
  },
  expiryLabel: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 4,
  },
  expiryTime: {
    fontSize: 20,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 12,
    color: '#856404',
  },
  tokenContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  tokenLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
    fontWeight: '600',
  },
  tokenText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#000',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  shareText: {
    color: '#fff',
  },
});
