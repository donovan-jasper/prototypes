import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as SQLite from 'expo-sqlite';
import { Swipeable } from 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const db = SQLite.openDatabase('metamender.db');

const InventoryScreen = () => {
  const [inventory, setInventory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    game: '',
    attack: '',
    defense: '',
    type: '',
    special: '',
  });

  useEffect(() => {
    db.transaction(tx => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS inventory (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, game TEXT, attack INTEGER, defense INTEGER, type TEXT, special TEXT);'
      );
      loadInventory();
    });
  }, []);

  const loadInventory = () => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM inventory ORDER BY game, name;',
        [],
        (_, { rows: { _array } }) => setInventory(_array)
      );
    });
  };

  const addItem = () => {
    if (!formData.name.trim() || !formData.game.trim()) {
      Alert.alert('Error', 'Name and Game are required');
      return;
    }

    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO inventory (name, game, attack, defense, type, special) VALUES (?, ?, ?, ?, ?, ?);',
        [
          formData.name,
          formData.game,
          parseInt(formData.attack) || 0,
          parseInt(formData.defense) || 0,
          formData.type,
          formData.special,
        ],
        () => {
          loadInventory();
          setModalVisible(false);
          setFormData({
            name: '',
            game: '',
            attack: '',
            defense: '',
            type: '',
            special: '',
          });
        }
      );
    });
  };

  const deleteItem = (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            db.transaction(tx => {
              tx.executeSql(
                'DELETE FROM inventory WHERE id = ?;',
                [id],
                () => loadInventory()
              );
            });
          },
        },
      ]
    );
  };

  const renderRightActions = (item) => {
    return (
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteItem(item.id)}
      >
        <Ionicons name="trash" size={24} color="#fff" />
      </TouchableOpacity>
    );
  };

  const groupedInventory = inventory.reduce((acc, item) => {
    if (!acc[item.game]) {
      acc[item.game] = [];
    }
    acc[item.game].push(item);
    return acc;
  }, {});

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item)}>
      <View style={styles.itemCard}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.type && (
            <Text style={styles.itemType}>{item.type}</Text>
          )}
        </View>
        <View style={styles.itemStats}>
          <Text style={styles.statText}>⚔️ {item.attack}</Text>
          <Text style={styles.statText}>🛡️ {item.defense}</Text>
        </View>
        {item.special && (
          <View style={styles.specialContainer}>
            <Text style={styles.specialLabel}>Special:</Text>
            <Text style={styles.specialText}>{item.special}</Text>
          </View>
        )}
      </View>
    </Swipeable>
  );

  const renderGameSection = (game, items) => (
    <View key={game} style={styles.gameSection}>
      <Text style={styles.gameSectionTitle}>{game}</Text>
      {items.map(item => (
        <View key={item.id}>
          {renderItem({ item })}
        </View>
      ))}
    </View>
  );

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        {inventory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={80} color="#ccc" />
            <Text style={styles.emptyTitle}>No items yet</Text>
            <Text style={styles.emptyDescription}>
              Add your first item to start building your inventory
            </Text>
          </View>
        ) : (
          <FlatList
            data={Object.keys(groupedInventory)}
            keyExtractor={(game) => game}
            renderItem={({ item: game }) => renderGameSection(game, groupedInventory[game])}
            contentContainerStyle={styles.listContainer}
          />
        )}

        <TouchableOpacity
          style={styles.fab}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add" size={32} color="#fff" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Gear Item</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close" size={28} color="#333" />
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Item Name *"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />

              <TextInput
                style={styles.input}
                placeholder="Game *"
                value={formData.game}
                onChangeText={(text) => setFormData({ ...formData, game: text })}
              />

              <View style={styles.rowInputs}>
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Attack"
                  keyboardType="numeric"
                  value={formData.attack}
                  onChangeText={(text) => setFormData({ ...formData, attack: text })}
                />
                <TextInput
                  style={[styles.input, styles.halfInput]}
                  placeholder="Defense"
                  keyboardType="numeric"
                  value={formData.defense}
                  onChangeText={(text) => setFormData({ ...formData, defense: text })}
                />
              </View>

              <TextInput
                style={styles.input}
                placeholder="Type (e.g., Weapon, Armor)"
                value={formData.type}
                onChangeText={(text) => setFormData({ ...formData, type: text })}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Special Perks"
                multiline
                numberOfLines={3}
                value={formData.special}
                onChangeText={(text) => setFormData({ ...formData, special: text })}
              />

              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Text style={styles.addButtonText}>Add Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  gameSection: {
    marginBottom: 24,
  },
  gameSectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  itemCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  itemType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  itemStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  specialContainer: {
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  specialLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  specialText: {
    fontSize: 14,
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 8,
    marginBottom: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default InventoryScreen;
