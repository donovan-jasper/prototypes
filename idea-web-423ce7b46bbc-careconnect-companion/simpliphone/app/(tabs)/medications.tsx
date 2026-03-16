import { View, StyleSheet, FlatList } from 'react-native';
import { useContext, useEffect } from 'react';
import { SettingsContext } from '../../contexts/SettingsContext';
import MedicationCard from '../../components/MedicationCard';
import { useMedications } from '../../hooks/useMedications';

export default function MedicationsScreen() {
  const { theme } = useContext(SettingsContext);
  const { medications, loadMedications } = useMedications();

  useEffect(() => {
    loadMedications();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={medications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <MedicationCard
            medication={item}
            onTakeNow={() => console.log(`Take ${item.name} now`)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
