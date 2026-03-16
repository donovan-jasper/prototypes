import React from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useModes } from '../../hooks/useModes';
import ModeCard from '../../components/ModeCard';
import { useNavigation } from '@react-navigation/native';

const ModesScreen = () => {
  const { modes } = useModes();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <FlatList
        data={modes}
        renderItem={({ item }) => <ModeCard mode={item} />}
        keyExtractor={item => item.id}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('modal')}
      >
        {/* Add button icon */}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  addButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ModesScreen;
