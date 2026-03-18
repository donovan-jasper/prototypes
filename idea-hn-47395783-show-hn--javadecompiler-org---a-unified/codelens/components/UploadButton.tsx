import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useDecompilation } from '../hooks/useDecompilation';

interface UploadButtonProps {
  onUploadStart?: () => void;
  onUploadComplete?: (decompilationId: number) => void;
  onUploadError?: (error: Error) => void;
}

const UploadButton: React.FC<UploadButtonProps> = ({ 
  onUploadStart, 
  onUploadComplete, 
  onUploadError 
}) => {
  const { uploadFile } = useDecompilation();
  const [isUploading, setIsUploading] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/java-archive', 'application/vnd.android.package-archive', 'application/octet-stream', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setIsUploading(true);
        onUploadStart?.();

        try {
          const decompilation = await uploadFile(result);
          setIsUploading(false);
          onUploadComplete?.(decompilation.id);
        } catch (error) {
          setIsUploading(false);
          onUploadError?.(error as Error);
          Alert.alert(
            'Decompilation Failed',
            error instanceof Error ? error.message : 'Failed to decompile file. Please try again.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (err) {
      setIsUploading(false);
      onUploadError?.(err as Error);
      console.error('Error picking document:', err);
      Alert.alert(
        'Upload Failed',
        'Failed to select file. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TouchableOpacity 
      onPress={pickDocument} 
      style={[styles.button, isUploading && styles.buttonDisabled]}
      disabled={isUploading}
    >
      <Text style={styles.buttonText}>
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default UploadButton;
