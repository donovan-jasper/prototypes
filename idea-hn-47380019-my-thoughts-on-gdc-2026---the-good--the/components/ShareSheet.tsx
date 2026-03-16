import { View, Text, Button, Alert } from 'react-native';

interface Props {
  generationId: string;
  onClose: () => void;
}

export default function ShareSheet({ generationId, onClose }: Props) {
  const handleShare = (platform: string) => {
    // Implementation would use expo-sharing
    Alert.alert(`Shared to ${platform}`, `Generation ${generationId} shared`);
    onClose();
  };

  return (
    <View style={{ 
      position: 'absolute', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      backgroundColor: 'white', 
      padding: 20 
    }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>Share to:</Text>
      
      <Button title="Instagram" onPress={() => handleShare('Instagram')} />
      <Button title="Twitter" onPress={() => handleShare('Twitter')} />
      <Button title="LinkedIn" onPress={() => handleShare('LinkedIn')} />
      
      <Button title="Cancel" onPress={onClose} />
    </View>
  );
}
