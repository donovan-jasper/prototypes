import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';

interface Props {
  token: string;
  expiryTime: number;
  onClose: () => void;
}

export default function QRCodeGenerator({ token, expiryTime, onClose }: Props) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = expiryTime - now;

      if (remaining <= 0) {
        setTimeRemaining('Expired');
        return;
      }

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiryTime]);

  const handleShare = async () => {
    try {
      setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      setIsLoading(true);
      await Clipboard.setStringAsync(token);
      Alert.alert('Success', 'Token copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy token');
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = Date.now() > expiryTime;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Verification Token</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {isExpired ? (
        <View style={styles.expiredContainer}>
          <Text style={styles.expiredText}>This token has expired</Text>
          <Text style={styles.expiredSubtext}>Please generate a new one</Text>
        </View>
      ) : (
        <>
          <View style={styles.qrContainer}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#007AFF" />
            ) : (
              <QRCode
                value={token}
                size={200}
                backgroundColor="white"
                color="black"
              />
            )}
          </View>

          <View style={styles.expiryContainer}>
            <Text style={styles.expiryLabel}>Expires in</Text>
            <Text style={styles.expiryTime}>{timeRemaining}</Text>
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
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleCopy}
              disabled={isLoading}
            >
              <Text style={styles.actionText}>Copy Token</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.shareButton]}
              onPress={handleShare}
              disabled={isLoading}
            >
              <Text style={[styles.actionText, styles.shareText]}>Share</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    color: '#1C1C1E',
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
    fontSize: 18,
    color: '#8E8E93',
  },
  expiredContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  expiredText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
  },
  expiredSubtext: {
    fontSize: 16,
    color: '#8E8E93',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  expiryContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  expiryLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 4,
  },
  expiryTime: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  expiryDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  tokenContainer: {
    marginBottom: 24,
  },
  tokenLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 8,
  },
  tokenText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    marginHorizontal: 4,
  },
  shareButton: {
    backgroundColor: '#007AFF',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  shareText: {
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
