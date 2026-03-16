import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useDecompilation } from '../hooks/useDecompilation';

const UploadButton = () => {
  const { uploadFile } = useDecompilation();

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/java-archive', 'application/vnd.android.package-archive', 'application/octet-stream'],
      });

      if (result.type === 'success') {
        await uploadFile(result);
      }
    } catch (err) {
      console.error('Error picking document:', err);
    }
  };

  return (
    <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: '#007AFF', padding: 12, borderRadius: 8 }}>
      <Text style={{ color: 'white', textAlign: 'center' }}>Upload File</Text>
    </TouchableOpacity>
  );
};

export default UploadButton;
