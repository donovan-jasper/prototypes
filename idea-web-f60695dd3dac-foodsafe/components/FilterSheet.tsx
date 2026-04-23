import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Switch } from 'react-native';
import { FilterOptions } from '@/types';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters: FilterOptions;
  isPremium: boolean;
}

const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  isPremium,
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Score</Text>
              <View style={styles.rangeContainer}>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={filters.minScore?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, minScore: text ? parseInt(text) : undefined })}
                />
                <Text style={styles.rangeSeparator}>-</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={filters.maxScore?.toString() || ''}
                  onChangeText={(text) => setFilters({ ...filters, maxScore: text ? parseInt(text) : undefined })}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cuisine</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Search cuisine"
                value={filters.cuisine || ''}
                onChangeText={(text) => setFilters({ ...filters, cuisine: text })}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inspection Status</Text>
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Recent inspection (last 30 days)</Text>
                <Switch
                  value={!!filters.hasRecentInspection}
                  onValueChange={(value) => setFilters({ ...filters, hasRecentInspection: value })}
                />
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>No violations</Text>
                <Switch
                  value={!!filters.hasNoViolations}
                  onValueChange={(value) => setFilters({ ...filters, hasNoViolations: value })}
                  disabled={!isPremium}
                />
                {!isPremium && (
                  <Text style={styles.premiumBadge}>Premium</Text>
                )}
              </View>
            </View>

            {isPremium && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Special Filters</Text>
                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Allergy-friendly</Text>
                  <Switch
                    value={!!filters.isAllergyFriendly}
                    onValueChange={(value) => setFilters({ ...filters, isAllergyFriendly: value })}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Kid-friendly</Text>
                  <Switch
                    value={!!filters.isKidFriendly}
                    onValueChange={(value) => setFilters({ ...filters, isKidFriendly: value })}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  rangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#666',
  },
  textInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  switchLabel: {
    fontSize: 14,
    color: '#333',
  },
  premiumBadge: {
    backgroundColor: '#4CAF50',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  resetButton: {
    flex: 1,
    marginRight: 8,
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    marginLeft: 8,
    padding: 12,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    alignItems: 'center',
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FilterSheet;
