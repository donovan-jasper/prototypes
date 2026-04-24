import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Modal } from 'react-native';
import QRCodeGenerator from './QRCodeGenerator';

interface Props {
  onVerify: () => Promise<{ token: string; expiryTime: number }>;
}

export default function VerificationButton({ onVerify }: Props) {
  const [loading, setLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [verificationData, setVerificationData] = useState<{
    token: string;
    expiryTime: number;
  } | null>(null);

  const handlePress = async () => {
    setLoading(true);
    try {
      const result = await onVerify();
      setVerificationData(result);
      setShowQRModal(true);
    } finally {
      setLoading(false);
    }
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
        visible={showQRModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowQRModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={styles.modalContent}
          >
            {verificationData && (
              <QRCodeGenerator
                token={verificationData.token}
                expiryTime={verificationData.expiryTime}
                onClose={() => setShowQRModal(false)}
              />
            )}
          </TouchableOpacity>
        </TouchableOpacity>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    alignItems: 'center',
  },
});
