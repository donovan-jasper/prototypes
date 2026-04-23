import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { Colors } from '@/constants/Colors';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  filters: {
    minScore: number;
    maxScore: number;
    recentInspection: boolean;
    noViolations: boolean;
    allergyFriendly: boolean;
  };
  onFilterChange: (filters: FilterSheetProps['filters']) => void;
  isPremium: boolean;
}

export const FilterSheet: React.FC<FilterSheetProps> = ({
  visible,
  onClose,
  filters,
  onFilterChange,
  isPremium,
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
  };

  const handleResetFilters = () => {
    setLocalFilters({
      minScore: 0,
      maxScore: 100,
      recentInspection: false,
      noViolations: false,
      allergyFriendly: false,
    });
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
            <Text style={styles.headerTitle}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Safety Score Range</Text>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Min: {localFilters.minScore}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={localFilters.minScore}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, minScore: value })}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
              </View>
              <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>Max: {localFilters.maxScore}</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  step={5}
                  value={localFilters.maxScore}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, maxScore: value })}
                  minimumTrackTintColor={Colors.primary}
                  maximumTrackTintColor={Colors.border}
                  thumbTintColor={Colors.primary}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Inspection Filters</Text>
              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Recent Inspection (last 30 days)</Text>
                <Switch
                  value={localFilters.recentInspection}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, recentInspection: value })}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={localFilters.recentInspection ? Colors.primary : Colors.white}
                />
              </View>

              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>No Violations</Text>
                <Switch
                  value={localFilters.noViolations}
                  onValueChange={(value) => setLocalFilters({ ...localFilters, noViolations: value })}
                  trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                  thumbColor={localFilters.noViolations ? Colors.primary : Colors.white}
                />
              </View>

              <View style={styles.filterOption}>
                <Text style={styles.filterLabel}>Allergy-Friendly</Text>
                {!isPremium ? (
                  <View style={styles.premiumBadge}>
                    <Text style={styles.premiumBadgeText}>Premium</Text>
                  </View>
                ) : (
                  <Switch
                    value={localFilters.allergyFriendly}
                    onValueChange={(value) => setLocalFilters({ ...localFilters, allergyFriendly: value })}
                    trackColor={{ false: Colors.border, true: Colors.primaryLight }}
                    thumbColor={localFilters.allergyFriendly ? Colors.primary : Colors.white}
                  />
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleResetFilters}>
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
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
    backgroundColor: Colors.white,
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
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  filterLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  premiumBadge: {
    backgroundColor: Colors.primaryLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 12,
    color: Colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  resetButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  applyButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  applyButtonText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '600',
  },
});
