import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Modal, View } from 'react-native';
import QRCodeGenerator from './QRCodeGenerator';

interface Props {
  onVerify: () => Promise<{ token: string; expiryTime: number }>;
}

export default function VerificationButton({ onVerify }: Props) {
  const [loading, setLoading] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    token: string;
    expiryTime: number;
  } | null>(null);

  const handlePress = async () => {
    setLoading(true);
    try {
      const data = await onVerify();
      setVerificationData(data);
      setShowQRCode(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseQRCode = () => {
    setShowQRCode(false);
    setVerificationData(null);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.text}>Verify I'm Human</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showQRCode}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCloseQRCode}
      >
        <View style={styles.modalContainer}>
          {verificationData && (
            <QRCodeGenerator
              token={verificationData.token}
              expiryTime={verificationData.expiryTime}
              onClose={handleCloseQRCode}
            />
          )}
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    marginTop: 20,
  },
  text: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
