import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Button, Card, Title, Paragraph } from 'react-native-paper';
import { loadContraption, deleteContraption } from '../../lib/storage';
import { useStore } from '../../lib/store';

export default function ContraptionScreen() {
  const { id } = useLocalSearchParams();
  const [contraption, setContraption] = useState(null);
  const router = useRouter();
  const { setParts } = useStore();

  useEffect(() => {
    const loadContraptionData = async () => {
      const data = await loadContraption(id);
      setContraption(data);
    };
    loadContraptionData();
  }, [id]);

  const handleEdit = () => {
    setParts(contraption.parts);
    router.push('/');
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Contraption',
      'Are you sure you want to delete this contraption?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteContraption(id);
            router.back();
          },
        },
      ]
    );
  };

  if (!contraption) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Cover source={{ uri: contraption.thumbnail }} />
        <Card.Content>
          <Title>{contraption.name}</Title>
          <Paragraph>Created: {new Date(contraption.createdAt).toLocaleDateString()}</Paragraph>
        </Card.Content>
        <Card.Actions>
          <Button onPress={handleEdit}>Edit</Button>
          <Button onPress={handleDelete}>Delete</Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
});
