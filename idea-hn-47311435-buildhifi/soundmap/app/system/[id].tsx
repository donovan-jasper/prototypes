import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { getSystemById } from '../../lib/database/queries';
import { SignalChain } from '../../components/SystemBuilder/SignalChain';
import { CompatibilityAlert } from '../../components/SystemBuilder/CompatibilityAlert';
import { Button } from 'react-native-paper';

export default function SystemDetailScreen() {
  const { id } = useLocalSearchParams();
  const [system, setSystem] = useState(null);

  useEffect(() => {
    const loadSystem = async () => {
      const result = await getSystemById(id);
      setSystem(result);
    };
    loadSystem();
  }, [id]);

  if (!system) {
    return <View />;
  }

  return (
    <View style={styles.container}>
      <CompatibilityAlert />
      <SignalChain components={system.components} />
      <Button
        mode="contained"
        onPress={() => console.log('Export shopping list')}
        style={styles.button}
      >
        Export Shopping List
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  button: {
    marginTop: 16,
  },
});
